import { ViewPlugin, gutter, Decoration, GutterMarker, EditorView, WidgetType } from "../../view/dist/index.js";
import { StateEffect, StateField, Facet, Prec, RangeSet, RangeSetBuilder, Compartment, EditorState } from "../../state/dist/index.js";
import { StyleModule } from "../../node_modules/style-mod/src/style-mod.js";

// This algorithm was heavily inspired by Neil Fraser's
// diff-match-patch library. See https://github.com/google/diff-match-patch/
/**
A changed range.
*/
class Change {
    constructor(
    /**
    The start of the change in document A.
    */
    fromA, 
    /**
    The end of the change in document A. This is equal to `fromA`
    in case of insertions.
    */
    toA, 
    /**
    The start of the change in document B.
    */
    fromB, 
    /**
    The end of the change in document B. This is equal to `fromB`
    for deletions.
    */
    toB) {
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    /**
    @internal
    */
    offset(offA, offB) {
        return new Change(this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB);
    }
}
function findDiff(a, fromA, toA, b, fromB, toB) {
    if (a == b)
        return [];
    // Remove identical prefix and suffix
    let prefix = commonPrefix(a, fromA, toA, b, fromB, toB);
    let suffix = commonSuffix(a, fromA + prefix, toA, b, fromB + prefix, toB);
    fromA += prefix;
    toA -= suffix;
    fromB += prefix;
    toB -= suffix;
    let lenA = toA - fromA, lenB = toB - fromB;
    // Nothing left in one of them
    if (!lenA || !lenB)
        return [new Change(fromA, toA, fromB, toB)];
    // Try to find one string in the other to cover cases with just 2
    // deletions/insertions.
    if (lenA > lenB) {
        let found = a.slice(fromA, toA).indexOf(b.slice(fromB, toB));
        if (found > -1)
            return [
                new Change(fromA, fromA + found, fromB, fromB),
                new Change(fromA + found + lenB, toA, toB, toB)
            ];
    }
    else if (lenB > lenA) {
        let found = b.slice(fromB, toB).indexOf(a.slice(fromA, toA));
        if (found > -1)
            return [
                new Change(fromA, fromA, fromB, fromB + found),
                new Change(toA, toA, fromB + found + lenA, toB)
            ];
    }
    // Only one character left on one side, does not occur in other
    // string.
    if (lenA == 1 || lenB == 1)
        return [new Change(fromA, toA, fromB, toB)];
    // Try to split the problem in two by finding a substring of one of
    // the strings in the other.
    let half = halfMatch(a, fromA, toA, b, fromB, toB);
    if (half) {
        let [sharedA, sharedB, sharedLen] = half;
        return findDiff(a, fromA, sharedA, b, fromB, sharedB)
            .concat(findDiff(a, sharedA + sharedLen, toA, b, sharedB + sharedLen, toB));
    }
    // Fall back to more expensive general search for a shared
    // subsequence.
    return findSnake(a, fromA, toA, b, fromB, toB);
}
// Implementation of Myers 1986 "An O(ND) Difference Algorithm and Its Variations"
function findSnake(a, fromA, toA, b, fromB, toB) {
    let lenA = toA - fromA, lenB = toB - fromB;
    let off = Math.ceil((lenA + lenB) / 2);
    frontier1.reset(off);
    frontier2.reset(off);
    let match1 = (x, y) => a.charCodeAt(fromA + x) == b.charCodeAt(fromB + y);
    let match2 = (x, y) => a.charCodeAt(toA - x - 1) == b.charCodeAt(toB - y - 1);
    let test1 = (lenA - lenB) % 2 != 0 ? frontier2 : null, test2 = test1 ? null : frontier1;
    for (let depth = 0; depth < off; depth++) {
        let done = frontier1.advance(depth, lenA, lenB, off, test1, false, match1) ||
            frontier2.advance(depth, lenA, lenB, off, test2, true, match2);
        if (done)
            return bisect(a, fromA, toA, fromA + done[0], b, fromB, toB, fromB + done[1]);
    }
    // No commonality at all.
    return [new Change(fromA, toA, fromB, toB)];
}
class Frontier {
    constructor() {
        this.vec = [];
    }
    reset(off) {
        this.len = off << 1;
        for (let i = 0; i < this.len; i++)
            this.vec[i] = -1;
        this.vec[off + 1] = 0;
        this.start = this.end = 0;
    }
    advance(depth, lenX, lenY, vOff, other, fromBack, match) {
        for (let k = -depth + this.start; k <= depth - this.end; k += 2) {
            let off = vOff + k;
            let x = k == -depth || (k != depth && this.vec[off - 1] < this.vec[off + 1])
                ? this.vec[off + 1] : this.vec[off - 1] + 1;
            let y = x - k;
            while (x < lenX && y < lenY && match(x, y)) {
                x++;
                y++;
            }
            this.vec[off] = x;
            if (x > lenX) {
                this.end += 2;
            }
            else if (y > lenY) {
                this.start += 2;
            }
            else if (other) {
                let offOther = vOff + (lenX - lenY) - k;
                if (offOther >= 0 && offOther < this.len && other.vec[offOther] != -1) {
                    if (!fromBack) {
                        let xOther = lenX - other.vec[offOther];
                        if (x >= xOther)
                            return [x, y];
                    }
                    else {
                        let xOther = other.vec[offOther];
                        if (xOther >= lenX - x)
                            return [xOther, vOff + xOther - offOther];
                    }
                }
            }
        }
        return null;
    }
}
// Reused across calls to avoid growing the vectors again and again
const frontier1 = /*@__PURE__*/new Frontier, frontier2 = /*@__PURE__*/new Frontier;
// Given a position in both strings, recursively call `findDiff` with
// the sub-problems before and after that position. Make sure cut
// points lie on character boundaries.
function bisect(a, fromA, toA, splitA, b, fromB, toB, splitB) {
    let stop = false;
    if (!validIndex(a, splitA) && ++splitA == toA)
        stop = true;
    if (!validIndex(b, splitB) && ++splitB == toB)
        stop = true;
    if (stop)
        return [new Change(fromA, toA, fromB, toB)];
    return findDiff(a, fromA, splitA, b, fromB, splitB).concat(findDiff(a, splitA, toA, b, splitB, toB));
}
function chunkSize(lenA, lenB) {
    let size = 1, max = Math.min(lenA, lenB);
    while (size < max)
        size = size << 1;
    return size;
}
// Common prefix length of the given ranges. Because string comparison
// is so much faster than a JavaScript by-character loop, this
// compares whole chunks at a time.
function commonPrefix(a, fromA, toA, b, fromB, toB) {
    if (fromA == toA || fromA == toB || a.charCodeAt(fromA) != b.charCodeAt(fromB))
        return 0;
    let chunk = chunkSize(toA - fromA, toB - fromB);
    for (let pA = fromA, pB = fromB;;) {
        let endA = pA + chunk, endB = pB + chunk;
        if (endA > toA || endB > toB || a.slice(pA, endA) != b.slice(pB, endB)) {
            if (chunk == 1)
                return pA - fromA - (validIndex(a, pA) ? 0 : 1);
            chunk = chunk >> 1;
        }
        else if (endA == toA || endB == toB) {
            return endA - fromA;
        }
        else {
            pA = endA;
            pB = endB;
        }
    }
}
// Common suffix length
function commonSuffix(a, fromA, toA, b, fromB, toB) {
    if (fromA == toA || fromB == toB || a.charCodeAt(toA - 1) != b.charCodeAt(toB - 1))
        return 0;
    let chunk = chunkSize(toA - fromA, toB - fromB);
    for (let pA = toA, pB = toB;;) {
        let sA = pA - chunk, sB = pB - chunk;
        if (sA < fromA || sB < fromB || a.slice(sA, pA) != b.slice(sB, pB)) {
            if (chunk == 1)
                return toA - pA - (validIndex(a, pA) ? 0 : 1);
            chunk = chunk >> 1;
        }
        else if (sA == fromA || sB == fromB) {
            return toA - sA;
        }
        else {
            pA = sA;
            pB = sB;
        }
    }
}
// Find a shared substring that is at least half the length of the
// longer range. Returns an array describing the substring [startA,
// startB, len], or null.
function halfMatch(a, fromA, toA, b, fromB, toB) {
    let lenA = toA - fromA, lenB = toB - fromB;
    if (lenA < lenB) {
        let result = halfMatch(b, fromB, toB, a, fromA, toA);
        return result && [result[1], result[0], result[2]];
    }
    // From here a is known to be at least as long as b
    if (lenA < 4 || lenB * 2 < lenA)
        return null;
    let rangeB = b.slice(fromB, toB);
    // Does a substring of `b` exist within `a` that is at least half
    // the length of `a`?
    function scanFrom(seedFrom) {
        // Look for a ¼ length substring
        let seedTo = seedFrom + Math.floor(lenA / 4);
        if (!validIndex(a, seedFrom))
            seedFrom++;
        if (!validIndex(a, seedTo))
            seedTo--;
        if (seedFrom >= seedTo)
            return null;
        let seed = a.slice(seedFrom, seedTo);
        let found = -1, best;
        while ((found = rangeB.indexOf(seed, found + 1)) != -1) {
            let prefixAfter = commonPrefix(a, seedTo, toA, b, fromB + found + seed.length, toB);
            let suffixBefore = commonSuffix(a, fromA, seedFrom, b, fromB, fromB + found);
            let length = seed.length + prefixAfter + suffixBefore;
            if (!best || best[2] < length)
                best = [seedFrom - suffixBefore, fromB + found - suffixBefore, length];
        }
        return best && best[2] * 2 > lenA ? best : null;
    }
    // Try to find a match around the second and third quarters of
    // string.
    let match1 = scanFrom(fromA + Math.ceil(lenA / 4));
    let match2 = scanFrom(fromA + Math.ceil(lenA / 2));
    return match1 && (!match2 || match2[2] < match1[2]) ? match1 : match2;
}
function mergeAdjacent(changes, minGap) {
    for (let i = 1; i < changes.length; i++) {
        let prev = changes[i - 1], cur = changes[i];
        if (prev.toA > cur.fromA - minGap && prev.toB > cur.fromB - minGap) {
            changes[i - 1] = new Change(prev.fromA, cur.toA, prev.fromB, cur.toB);
            changes.splice(i--, 1);
        }
    }
}
// Reorder and merge changes
function normalize(a, b, changes) {
    for (;;) {
        mergeAdjacent(changes, 1);
        let moved = false;
        // Move unchanged ranges that can be fully moved across an
        // adjacent insertion/deletion, to simplify the diff.
        for (let i = 0; i < changes.length; i++) {
            let ch = changes[i], pre, post;
            // The half-match heuristic sometimes produces non-minimal
            // diffs. Strip matching pre- and post-fixes again here.
            if (pre = commonPrefix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB))
                ch = changes[i] = new Change(ch.fromA + pre, ch.toA, ch.fromB + pre, ch.toB);
            if (post = commonSuffix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB))
                ch = changes[i] = new Change(ch.fromA, ch.toA - post, ch.fromB, ch.toB - post);
            let lenA = ch.toA - ch.fromA, lenB = ch.toB - ch.fromB;
            // Only look at plain insertions/deletions
            if (lenA && lenB)
                continue;
            let beforeLen = ch.fromA - (i ? changes[i - 1].toA : 0);
            let afterLen = (i < changes.length - 1 ? changes[i + 1].fromA : a.length) - ch.toA;
            if (!beforeLen || !afterLen)
                continue;
            let text = lenA ? a.slice(ch.fromA, ch.toA) : b.slice(ch.fromB, ch.toB);
            if (beforeLen <= text.length &&
                a.slice(ch.fromA - beforeLen, ch.fromA) == text.slice(text.length - beforeLen)) {
                // Text before matches the end of the change
                changes[i] = new Change(ch.fromA - beforeLen, ch.toA - beforeLen, ch.fromB - beforeLen, ch.toB - beforeLen);
                moved = true;
            }
            else if (afterLen <= text.length &&
                a.slice(ch.toA, ch.toA + afterLen) == text.slice(0, afterLen)) {
                // Text after matches the start of the change
                changes[i] = new Change(ch.fromA + afterLen, ch.toA + afterLen, ch.fromB + afterLen, ch.toB + afterLen);
                moved = true;
            }
        }
        if (!moved)
            break;
    }
    return changes;
}
// Process a change set to make it suitable for presenting to users.
function makePresentable(changes, a, b) {
    for (let posA = 0, i = 0; i < changes.length; i++) {
        let change = changes[i];
        let lenA = change.toA - change.fromA, lenB = change.toB - change.fromB;
        // Don't touch short insertions or deletions.
        if (lenA && lenB || lenA > 3 || lenB > 3) {
            let nextChangeA = i == changes.length - 1 ? a.length : changes[i + 1].fromA;
            let maxScanBefore = change.fromA - posA, maxScanAfter = nextChangeA - change.toA;
            let boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(maxScanBefore, 5));
            let boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(maxScanAfter, 5));
            let lenBefore = change.fromA - boundBefore, lenAfter = boundAfter - change.toA;
            if (!lenA || !lenB) {
                let changeLen = Math.max(lenA, lenB);
                let [changeText, changeFrom, changeTo] = lenA ? [a, change.fromA, change.toA] : [b, change.fromB, change.toB];
                let indentBefore, indentLen;
                // An insertion or deletion that falls inside words on both
                // sides can maybe be moved to align with word boundaries.
                if (lenBefore && lenAfter) {
                    if (changeLen > lenBefore &&
                        a.slice(boundBefore, change.fromA) == changeText.slice(changeTo - lenBefore, changeTo)) {
                        change = changes[i] = new Change(boundBefore, boundBefore + lenA, change.fromB - lenBefore, change.toB - lenBefore);
                        boundBefore = change.fromA;
                        boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(nextChangeA - change.toA, 5));
                    }
                    else if (changeLen > lenAfter &&
                        a.slice(change.toA, boundAfter) == changeText.slice(changeFrom, changeFrom + lenAfter)) {
                        change = changes[i] = new Change(boundAfter - lenA, boundAfter, change.fromB + lenAfter, change.toB + lenAfter);
                        boundAfter = change.toA;
                        boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(change.fromA - posA, 5));
                    }
                    lenBefore = change.fromA - boundBefore;
                    lenAfter = boundAfter - change.toA;
                    // Indentation before the change is repeated at its end. Move it across.
                }
                else if (!lenBefore && !lenAfter &&
                    (indentLen = change.fromA - (indentBefore = findIndentBefore(a, change.fromA, maxScanBefore))) &&
                    a.slice(indentBefore, change.fromA) == changeText.slice(changeTo - indentLen, changeTo)) {
                    change = changes[i] = new Change(indentBefore, indentBefore + lenA, change.fromB - indentLen, change.toB - indentLen);
                }
            }
            // Grow the change to the word boundaries.
            if (lenBefore || lenAfter) {
                change = changes[i] = new Change(change.fromA - lenBefore, change.toA + lenAfter, change.fromB - lenBefore, change.toB + lenAfter);
            }
            posA = change.toA;
        }
    }
    mergeAdjacent(changes, 3);
    return changes;
}
let wordChar;
try {
    wordChar = /*@__PURE__*/new RegExp("[\\p{Alphabetic}\\p{Number}]", "u");
}
catch (_) { }
function asciiWordChar(code) {
    return code > 48 && code < 58 || code > 64 && code < 91 || code > 96 && code < 123;
}
function wordCharAfter(s, pos) {
    if (pos == s.length)
        return 0;
    let next = s.charCodeAt(pos);
    if (next < 192)
        return asciiWordChar(next) ? 1 : 0;
    if (!wordChar)
        return 0;
    if (!isSurrogate1(next) || pos == s.length - 1)
        return wordChar.test(String.fromCharCode(next)) ? 1 : 0;
    return wordChar.test(s.slice(pos, pos + 2)) ? 2 : 0;
}
function wordCharBefore(s, pos) {
    if (!pos)
        return 0;
    let prev = s.charCodeAt(pos - 1);
    if (prev < 192)
        return asciiWordChar(prev) ? 1 : 0;
    if (!wordChar)
        return 0;
    if (!isSurrogate2(prev) || pos == 1)
        return wordChar.test(String.fromCharCode(prev)) ? 1 : 0;
    return wordChar.test(s.slice(pos - 2, pos)) ? 2 : 0;
}
function findWordBoundaryAfter(s, pos, max) {
    if (pos == s.length || !wordCharBefore(s, pos))
        return pos;
    for (let cur = pos, end = pos + max;;) {
        let size = wordCharAfter(s, cur);
        if (!size)
            return cur;
        cur += size;
        if (cur > end)
            return pos;
    }
}
function findWordBoundaryBefore(s, pos, max) {
    if (!pos || !wordCharAfter(s, pos))
        return pos;
    for (let cur = pos, end = pos - max;;) {
        let size = wordCharBefore(s, cur);
        if (!size)
            return cur;
        cur -= size;
        if (cur < end)
            return pos;
    }
}
function findIndentBefore(s, pos, max) {
    for (let cur = pos, end = pos - max;;) {
        let next = cur ? s.charCodeAt(cur - 1) : 10;
        if (next == 10)
            return cur;
        cur--;
        if (cur < end || (next != 32 && next != 9))
            return pos;
    }
}
const isSurrogate1 = (code) => code >= 0xD800 && code <= 0xDBFF;
const isSurrogate2 = (code) => code >= 0xDC00 && code <= 0xDFFF;
// Returns false if index looks like it is in the middle of a
// surrogate pair.
function validIndex(s, index) {
    return !index || index == s.length || !isSurrogate1(s.charCodeAt(index - 1)) || !isSurrogate2(s.charCodeAt(index));
}
/**
Compute the difference between two strings.
*/
function diff(a, b) {
    return normalize(a, b, findDiff(a, 0, a.length, b, 0, b.length));
}
/**
Compute the difference between the given strings, and clean up the
resulting diff for presentation to users by dropping short
unchanged ranges, and aligning changes to word boundaries when
appropriate.
*/
function presentableDiff(a, b) {
    return makePresentable(diff(a, b), a, b);
}

/**
A chunk describes a range of lines which have changed content in
them. Either side (a/b) may either be empty (when its `to` is
equal to its `from`), or points at a range starting at the start
of the first changed line, to 1 past the end of the last changed
line. Note that `to` positions may point past the end of the
document. Use `endA`/`endB` if you need an end position that is
certain to be a valid document position.
*/
class Chunk {
    constructor(
    /**
    The individual changes inside this chunk. These are stored
    relative to the start of the chunk, so you have to add
    `chunk.fromA`/`fromB` to get document positions.
    */
    changes, 
    /**
    The start of the chunk in document A.
    */
    fromA, 
    /**
    The end of the chunk in document A. This is equal to `fromA`
    when the chunk covers no lines in document A, or is one unit
    past the end of the last line in the chunk if it does.
    */
    toA, 
    /**
    The start of the chunk in document B.
    */
    fromB, 
    /**
    The end of the chunk in document A.
    */
    toB) {
        this.changes = changes;
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    /**
    @internal
    */
    offset(offA, offB) {
        return offA || offB
            ? new Chunk(this.changes, this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB)
            : this;
    }
    /**
    Returns `fromA` if the chunk is empty in A, or the end of the
    last line in the chunk otherwise.
    */
    get endA() { return Math.max(this.fromA, this.toA - 1); }
    /**
    Returns `fromB` if the chunk is empty in B, or the end of the
    last line in the chunk otherwise.
    */
    get endB() { return Math.max(this.fromB, this.toB - 1); }
    /**
    Build a set of changed chunks for the given documents.
    */
    static build(a, b) {
        return toChunks(presentableDiff(a.toString(), b.toString()), a, b, 0, 0);
    }
    /**
    Update a set of chunks for changes in document A. `a` should
    hold the updated document A.
    */
    static updateA(chunks, a, b, changes) {
        return updateChunks(findRangesForChange(chunks, changes, true, b.length), chunks, a, b);
    }
    /**
    Update a set of chunks for changes in document B.
    */
    static updateB(chunks, a, b, changes) {
        return updateChunks(findRangesForChange(chunks, changes, false, a.length), chunks, a, b);
    }
}
function fromLine(fromA, fromB, a, b) {
    let lineA = a.lineAt(fromA), lineB = b.lineAt(fromB);
    return lineA.to == fromA && lineB.to == fromB && fromA < a.length && fromB < b.length
        ? [fromA + 1, fromB + 1] : [lineA.from, lineB.from];
}
function toLine(toA, toB, a, b) {
    let lineA = a.lineAt(toA), lineB = b.lineAt(toB);
    return lineA.from == toA && lineB.from == toB ? [toA, toB] : [lineA.to + 1, lineB.to + 1];
}
function toChunks(changes, a, b, offA, offB) {
    let chunks = [];
    for (let i = 0; i < changes.length; i++) {
        let change = changes[i];
        let [fromA, fromB] = fromLine(change.fromA + offA, change.fromB + offB, a, b);
        let [toA, toB] = toLine(change.toA + offA, change.toB + offB, a, b);
        let chunk = [change.offset(-fromA + offA, -fromB + offB)];
        while (i < changes.length - 1) {
            let next = changes[i + 1];
            let [nextA, nextB] = fromLine(next.fromA + offA, next.fromB + offB, a, b);
            if (nextA > toA + 1 && nextB > toB + 1)
                break;
            chunk.push(next.offset(-fromA + offA, -fromB + offB));
            [toA, toB] = toLine(next.toA + offA, next.toB + offB, a, b);
            i++;
        }
        chunks.push(new Chunk(chunk, fromA, Math.max(fromA, toA), fromB, Math.max(fromB, toB)));
    }
    return chunks;
}
const updateMargin = 1000;
// Finds the given position in the chunks. Returns the extent of the
// chunk it overlaps with if it overlaps, or a position corresponding
// to that position on both sides otherwise.
function findPos(chunks, pos, isA, start) {
    let lo = 0, hi = chunks.length;
    for (;;) {
        if (lo == hi) {
            let refA = 0, refB = 0;
            if (lo)
                ({ toA: refA, toB: refB } = chunks[lo - 1]);
            let off = pos - (isA ? refA : refB);
            return [refA + off, refB + off];
        }
        let mid = (lo + hi) >> 1, chunk = chunks[mid];
        let [from, to] = isA ? [chunk.fromA, chunk.toA] : [chunk.fromB, chunk.toB];
        if (from > pos)
            hi = mid;
        else if (to <= pos)
            lo = mid + 1;
        else
            return start ? [chunk.fromA, chunk.fromB] : [chunk.toA, chunk.toB];
    }
}
function findRangesForChange(chunks, changes, isA, otherLen) {
    let ranges = [];
    changes.iterChangedRanges((cFromA, cToA, cFromB, cToB) => {
        let fromA = 0, toA = isA ? changes.length : otherLen;
        let fromB = 0, toB = isA ? otherLen : changes.length;
        if (cFromA > updateMargin)
            [fromA, fromB] = findPos(chunks, cFromA - updateMargin, isA, true);
        if (cToA < changes.length - updateMargin)
            [toA, toB] = findPos(chunks, cToA + updateMargin, isA, false);
        let lenDiff = (cToB - cFromB) - (cToA - cFromA), last;
        let [diffA, diffB] = isA ? [lenDiff, 0] : [0, lenDiff];
        if (ranges.length && (last = ranges[ranges.length - 1]).toA >= fromA)
            ranges[ranges.length - 1] = { fromA: last.fromA, fromB: last.fromB, toA, toB,
                diffA: last.diffA + diffA, diffB: last.diffB + diffB };
        else
            ranges.push({ fromA, toA, fromB, toB, diffA, diffB });
    });
    return ranges;
}
function updateChunks(ranges, chunks, a, b) {
    if (!ranges.length)
        return chunks;
    let chunkI = 0, offA = 0, offB = 0;
    let result = [];
    for (let range of ranges) {
        let fromA = range.fromA + offA, toA = range.toA + offA + range.diffA;
        let fromB = range.fromB + offB, toB = range.toB + offB + range.diffB;
        while (chunkI < chunks.length) {
            let next = chunks[chunkI];
            if (next.toA + offA <= fromA && next.toB + offB <= fromB)
                result.push(next.offset(offA, offB));
            else if (next.fromA + offA > toA)
                break;
            chunkI++;
        }
        for (let chunk of toChunks(presentableDiff(a.sliceString(fromA, toA), b.sliceString(fromB, toB)), a, b, fromA, fromB))
            result.push(chunk);
        offA += range.diffA;
        offB += range.diffB;
    }
    while (chunkI < chunks.length)
        result.push(chunks[chunkI++].offset(offA, offB));
    return result;
}
const setChunks = /*@__PURE__*/StateEffect.define();
const ChunkField = /*@__PURE__*/StateField.define({
    create(state) {
        return null;
    },
    update(current, tr) {
        for (let e of tr.effects)
            if (e.is(setChunks))
                current = e.value;
        return current;
    }
});

const mergeConfig = /*@__PURE__*/Facet.define({
    combine: values => values[0]
});
const decorateChunks = /*@__PURE__*/ViewPlugin.fromClass(class {
    constructor(view) {
        ({ deco: this.deco, gutter: this.gutter } = getChunkDeco(view));
    }
    update(update) {
        if (update.docChanged || update.viewportChanged || chunksChanged(update.startState, update.state) ||
            configChanged(update.startState, update.state))
            ({ deco: this.deco, gutter: this.gutter } = getChunkDeco(update.view));
    }
}, {
    decorations: d => d.deco
});
const changeGutter = /*@__PURE__*/Prec.low(/*@__PURE__*/gutter({
    class: "cm-changeGutter",
    markers: view => { var _a; return ((_a = view.plugin(decorateChunks)) === null || _a === void 0 ? void 0 : _a.gutter) || RangeSet.empty; },
    renderEmptyElements: false
}));
function chunksChanged(s1, s2) {
    return s1.field(ChunkField, false) != s2.field(ChunkField, false);
}
function configChanged(s1, s2) {
    return s1.facet(mergeConfig) != s2.facet(mergeConfig);
}
const changedLine = /*@__PURE__*/Decoration.line({ class: "cm-changedLine" });
const changedText = /*@__PURE__*/Decoration.mark({ class: "cm-changedText" });
const changedLineGutterMarker = /*@__PURE__*/new class extends GutterMarker {
    constructor() {
        super(...arguments);
        this.elementClass = "cm-changedLineGutter";
    }
};
function buildChunkDeco(chunk, doc, isA, highlight, builder, gutterBuilder) {
    let from = isA ? chunk.fromA : chunk.fromB, to = isA ? chunk.toA : chunk.toB;
    let changeI = 0;
    if (from != to) {
        builder.add(from, from, changedLine);
        if (gutterBuilder)
            gutterBuilder.add(from, from, changedLineGutterMarker);
        for (let iter = doc.iterRange(from, to - 1), pos = from; !iter.next().done;) {
            if (iter.lineBreak) {
                pos++;
                builder.add(pos, pos, changedLine);
                if (gutterBuilder)
                    gutterBuilder.add(pos, pos, changedLineGutterMarker);
                continue;
            }
            let lineEnd = pos + iter.value.length;
            if (highlight)
                while (changeI < chunk.changes.length) {
                    let nextChange = chunk.changes[changeI];
                    let nextFrom = from + (isA ? nextChange.fromA : nextChange.fromB);
                    let nextTo = from + (isA ? nextChange.toA : nextChange.toB);
                    let chFrom = Math.max(pos, nextFrom), chTo = Math.min(lineEnd, nextTo);
                    if (chFrom < chTo)
                        builder.add(chFrom, chTo, changedText);
                    if (nextTo < lineEnd)
                        changeI++;
                    else
                        break;
                }
            pos = lineEnd;
        }
    }
}
function getChunkDeco(view) {
    let chunks = view.state.field(ChunkField);
    let { side, highlightChanges, markGutter } = view.state.facet(mergeConfig), isA = side == "a";
    let builder = new RangeSetBuilder();
    let gutterBuilder = markGutter ? new RangeSetBuilder() : null;
    let { from, to } = view.viewport;
    for (let chunk of chunks) {
        if ((isA ? chunk.fromA : chunk.fromB) >= to)
            break;
        if ((isA ? chunk.toA : chunk.toB) > from)
            buildChunkDeco(chunk, view.state.doc, isA, highlightChanges, builder, gutterBuilder);
    }
    return { deco: builder.finish(), gutter: gutterBuilder && gutterBuilder.finish() };
}
class Spacer extends WidgetType {
    constructor(height) {
        super();
        this.height = height;
    }
    eq(other) { return this.height == other.height; }
    toDOM() {
        let elt = document.createElement("div");
        elt.className = "cm-mergeSpacer";
        elt.style.height = this.height + "px";
        return elt;
    }
    updateDOM(dom) {
        dom.style.height = this.height + "px";
        return true;
    }
    get estimatedHeight() { return this.height; }
    ignoreEvent() { return false; }
}
const adjustSpacers = /*@__PURE__*/StateEffect.define({
    map: (value, mapping) => value.map(mapping)
});
const Spacers = /*@__PURE__*/StateField.define({
    create: () => Decoration.none,
    update: (spacers, tr) => {
        for (let e of tr.effects)
            if (e.is(adjustSpacers))
                return e.value;
        return spacers.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
});
const epsilon = .0001;
function updateSpacers(a, b, chunks) {
    let buildA = new RangeSetBuilder(), buildB = new RangeSetBuilder();
    let linesA = a.viewportLineBlocks, linesB = b.viewportLineBlocks, iA = 0, iB = 0;
    let spacersA = a.state.field(Spacers).iter(), spacersB = b.state.field(Spacers).iter();
    let posA = 0, posB = 0, offA = 0, offB = 0;
    chunks: for (let chunkI = 0;; chunkI++) {
        let chunk = chunkI < chunks.length ? chunks[chunkI] : null;
        let [endA, endB] = chunk ? [chunk.fromA, chunk.fromB] : [a.state.doc.length, b.state.doc.length];
        // Find lines whose start lies in the unchanged pos-end ranges and
        // who have a matching line in the other editor.
        if (posA < endA && posB < endB)
            for (;;) {
                if (iA == linesA.length || iB == linesB.length)
                    break chunks;
                let lineA = linesA[iA], lineB = linesB[iB];
                while (spacersA.value && spacersA.from < lineA.from) {
                    offA -= spacersA.value.spec.widget.height;
                    spacersA.next();
                }
                while (spacersB.value && spacersB.from < lineB.from) {
                    offB -= spacersB.value.spec.widget.height;
                    spacersB.next();
                }
                if (lineA.from >= endA || lineB.from >= endB)
                    break;
                let relA = lineA.from - posA, relB = lineB.from - posB;
                if (relA < 0 || relA < relB) {
                    iA++;
                }
                else if (relB < 0 || relB < relA) {
                    iB++;
                }
                else { // Align these two lines
                    let diff = (lineA.top + offA) - (lineB.top + offB);
                    if (diff < -epsilon) {
                        offA -= diff;
                        buildA.add(lineA.from, lineA.from, Decoration.widget({
                            widget: new Spacer(-diff),
                            block: true,
                            side: -1
                        }));
                    }
                    else if (diff > epsilon) {
                        offB += diff;
                        buildB.add(lineB.from, lineB.from, Decoration.widget({
                            widget: new Spacer(diff),
                            block: true,
                            side: -1
                        }));
                    }
                    iA++;
                    iB++;
                }
            }
        if (!chunk)
            break;
        posA = chunk.toA;
        posB = chunk.toB;
    }
    while (spacersA.value) {
        offA -= spacersA.value.spec.widget.height;
        spacersA.next();
    }
    while (spacersB.value) {
        offB -= spacersB.value.spec.widget.height;
        spacersB.next();
    }
    let docDiff = (a.contentHeight + offA) - (b.contentHeight + offB);
    if (docDiff < epsilon)
        buildA.add(a.state.doc.length, a.state.doc.length, Decoration.widget({
            widget: new Spacer(-docDiff),
            block: true,
            side: 1
        }));
    else if (docDiff > epsilon)
        buildB.add(b.state.doc.length, b.state.doc.length, Decoration.widget({
            widget: new Spacer(docDiff),
            block: true,
            side: 1
        }));
    let decoA = buildA.finish(), decoB = buildB.finish();
    if (!RangeSet.eq([decoA], [a.state.field(Spacers)]))
        a.dispatch({ effects: adjustSpacers.of(decoA) });
    if (!RangeSet.eq([decoB], [b.state.field(Spacers)]))
        b.dispatch({ effects: adjustSpacers.of(decoB) });
}
const uncollapse = /*@__PURE__*/StateEffect.define({
    map: (value, change) => change.mapPos(value)
});
class CollapseWidget extends WidgetType {
    constructor(lines) {
        super();
        this.lines = lines;
    }
    eq(other) { return this.lines == other.lines; }
    toDOM(view) {
        let outer = document.createElement("div");
        outer.className = "cm-collapsedLines";
        outer.textContent = "⦚ " + view.state.phrase("$ unchanged lines", this.lines) + " ⦚";
        outer.addEventListener("click", e => {
            let pos = view.posAtDOM(e.target);
            view.dispatch({ effects: uncollapse.of(pos) });
            let { side, sibling } = view.state.facet(mergeConfig);
            sibling().dispatch({ effects: uncollapse.of(mapPos(pos, view.state.field(ChunkField), side == "a")) });
        });
        return outer;
    }
    ignoreEvent(e) { return e instanceof MouseEvent; }
    get estimatedHeight() { return 27; }
}
function mapPos(pos, chunks, isA) {
    let startOur = 0, startOther = 0;
    for (let i = 0;; i++) {
        let next = i < chunks.length ? chunks[i] : null;
        if (!next || (isA ? next.fromA : next.fromB) >= pos)
            return startOther + (pos - startOur);
        [startOur, startOther] = isA ? [next.toA, next.toB] : [next.toB, next.toA];
    }
}
const CollapsedRanges = /*@__PURE__*/StateField.define({
    create(state) { return Decoration.none; },
    update(deco, tr) {
        deco = deco.map(tr.changes);
        for (let e of tr.effects)
            if (e.is(uncollapse))
                deco = deco.update({ filter: from => from != e.value });
        return deco;
    },
    provide: f => EditorView.decorations.from(f)
});
function collapseUnchanged({ margin = 3, minSize = 4 }) {
    return CollapsedRanges.init(state => buildCollapsedRanges(state, margin, minSize));
}
function buildCollapsedRanges(state, margin, minLines) {
    let builder = new RangeSetBuilder();
    let isA = state.facet(mergeConfig).side == "a";
    let chunks = state.field(ChunkField);
    let prevLine = 1;
    for (let i = 0;; i++) {
        let chunk = i < chunks.length ? chunks[i] : null;
        let collapseFrom = i ? prevLine + margin : 1;
        let collapseTo = chunk ? state.doc.lineAt(isA ? chunk.fromA : chunk.fromB).number - 1 - margin : state.doc.lines;
        let lines = collapseTo - collapseFrom + 1;
        if (lines >= minLines) {
            builder.add(state.doc.line(collapseFrom).from, state.doc.line(collapseTo).to, Decoration.replace({
                widget: new CollapseWidget(lines),
                block: true
            }));
        }
        if (!chunk)
            break;
        prevLine = state.doc.lineAt(Math.min(state.doc.length, isA ? chunk.toA : chunk.toB)).number;
    }
    return builder.finish();
}

const externalTheme = /*@__PURE__*/EditorView.styleModule.of(/*@__PURE__*/new StyleModule({
    ".cm-mergeView": {
        overflowY: "auto",
    },
    ".cm-mergeViewEditors": {
        display: "flex",
        alignItems: "stretch",
    },
    ".cm-mergeViewEditor": {
        flexGrow: 1,
        flexBasis: 0,
        overflow: "hidden"
    },
    ".cm-merge-revert": {
        width: "1.6em",
        flexGrow: 0,
        flexShrink: 0,
        position: "relative"
    },
    ".cm-merge-revert button": {
        position: "absolute",
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        background: "none",
        border: "none",
        font: "inherit",
        cursor: "pointer"
    }
}));
const baseTheme = /*@__PURE__*/EditorView.baseTheme({
    "& .cm-scroller, &": {
        height: "auto !important",
        overflowY: "visible !important"
    },
    "&.cm-merge-a .cm-changedLine": {
        backgroundColor: "rgba(160, 128, 100, .08)"
    },
    "&.cm-merge-b .cm-changedLine": {
        backgroundColor: "rgba(100, 160, 128, .08)"
    },
    "&light.cm-merge-a .cm-changedText": {
        background: "linear-gradient(#ee443366, #ee443366) bottom/100% 2px no-repeat",
    },
    "&dark.cm-merge-a .cm-changedText": {
        background: "linear-gradient(#ffaa9966, #ffaa9966) bottom/100% 2px no-repeat",
    },
    "&light.cm-merge-b .cm-changedText": {
        background: "linear-gradient(#22bb2266, #22bb2266) bottom/100% 2px no-repeat",
    },
    "&dark.cm-merge-b .cm-changedText": {
        background: "linear-gradient(#88ff8866, #88ff8866) bottom/100% 2px no-repeat",
    },
    ".cm-collapsedLines": {
        padding: "5px 5px 5px 10px",
        cursor: "pointer"
    },
    "&light .cm-collapsedLines": {
        color: "#444",
        background: "linear-gradient(to bottom, transparent 0, #f3f3f3 30%, #f3f3f3 70%, transparent 100%)"
    },
    "&dark .cm-collapsedLines": {
        color: "#ddd",
        background: "linear-gradient(to bottom, transparent 0, #222 30%, #222 70%, transparent 100%)"
    },
    ".cm-changeGutter": { width: "3px", paddingLeft: "1px" },
    "&light.cm-merge-a .cm-changedLineGutter": { background: "#e43" },
    "&dark.cm-merge-a .cm-changedLineGutter": { background: "#fa9" },
    "&light.cm-merge-b .cm-changedLineGutter": { background: "#2b2" },
    "&dark.cm-merge-b .cm-changedLineGutter": { background: "#8f8" },
});

const collapseCompartment = /*@__PURE__*/new Compartment, configCompartment = /*@__PURE__*/new Compartment;
/**
A merge view manages two editors side-by-side, highlighting the
difference between them and vertically aligning unchanged lines.
If you want one of the editors to be read-only, you have to
configure that in its extensions.

By default, views are not scrollable. Style them (`.cm-mergeView`)
with a height and `overflow: auto` to make them scrollable.
*/
class MergeView {
    /**
    Create a new merge view.
    */
    constructor(config) {
        this.revertDOM = null;
        this.revertToA = false;
        this.revertToLeft = false;
        this.measuring = -1;
        let sharedExtensions = [
            Prec.low(decorateChunks),
            baseTheme,
            externalTheme,
            Spacers,
            EditorView.updateListener.of(update => {
                if (this.measuring < 0 && (update.heightChanged || update.viewportChanged) &&
                    !update.transactions.some(tr => tr.effects.some(e => e.is(adjustSpacers))))
                    this.measure();
            }),
        ];
        let configA = [mergeConfig.of({
                side: "a",
                sibling: () => this.b,
                highlightChanges: config.highlightChanges !== false,
                markGutter: config.gutter !== false
            })];
        if (config.gutter !== false)
            configA.push(changeGutter);
        let stateA = EditorState.create({
            doc: config.a.doc,
            selection: config.a.selection,
            extensions: [
                config.a.extensions || [],
                EditorView.editorAttributes.of({ class: "cm-merge-a" }),
                configCompartment.of(configA),
                sharedExtensions
            ]
        });
        let configB = [mergeConfig.of({
                side: "b",
                sibling: () => this.a,
                highlightChanges: config.highlightChanges !== false,
                markGutter: config.gutter !== false
            })];
        if (config.gutter !== false)
            configB.push(changeGutter);
        let stateB = EditorState.create({
            doc: config.b.doc,
            selection: config.b.selection,
            extensions: [
                config.b.extensions || [],
                EditorView.editorAttributes.of({ class: "cm-merge-b" }),
                configCompartment.of(configB),
                sharedExtensions
            ]
        });
        this.chunks = Chunk.build(stateA.doc, stateB.doc);
        let add = [
            ChunkField.init(() => this.chunks),
            collapseCompartment.of(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : [])
        ];
        stateA = stateA.update({ effects: StateEffect.appendConfig.of(add) }).state;
        stateB = stateB.update({ effects: StateEffect.appendConfig.of(add) }).state;
        this.dom = document.createElement("div");
        this.dom.className = "cm-mergeView";
        this.editorDOM = this.dom.appendChild(document.createElement("div"));
        this.editorDOM.className = "cm-mergeViewEditors";
        let orientation = config.orientation || "a-b";
        let wrapA = document.createElement("div");
        wrapA.className = "cm-mergeViewEditor";
        let wrapB = document.createElement("div");
        wrapB.className = "cm-mergeViewEditor";
        this.editorDOM.appendChild(orientation == "a-b" ? wrapA : wrapB);
        this.editorDOM.appendChild(orientation == "a-b" ? wrapB : wrapA);
        this.a = new EditorView({
            state: stateA,
            parent: wrapA,
            root: config.root,
            dispatch: tr => this.dispatch(tr, this.a)
        });
        this.b = new EditorView({
            state: stateB,
            parent: wrapB,
            root: config.root,
            dispatch: tr => this.dispatch(tr, this.b)
        });
        this.setupRevertControls(!!config.revertControls, config.revertControls == "b-to-a", config.renderRevertControl);
        if (config.parent)
            config.parent.appendChild(this.dom);
        this.scheduleMeasure();
    }
    dispatch(tr, target) {
        if (tr.docChanged) {
            this.chunks = target == this.a ? Chunk.updateA(this.chunks, tr.newDoc, this.b.state.doc, tr.changes)
                : Chunk.updateB(this.chunks, this.a.state.doc, tr.newDoc, tr.changes);
            target.update([tr, tr.state.update({ effects: setChunks.of(this.chunks) })]);
            let other = target == this.a ? this.b : this.a;
            other.update([other.state.update({ effects: setChunks.of(this.chunks) })]);
            this.scheduleMeasure();
        }
        else {
            target.update([tr]);
        }
    }
    /**
    Reconfigure an existing merge view.
    */
    reconfigure(config) {
        if ("orientation" in config) {
            let aB = config.orientation != "b-a";
            if (aB != (this.editorDOM.firstChild == this.a.dom.parentNode)) {
                let domA = this.a.dom.parentNode, domB = this.b.dom.parentNode;
                domA.remove();
                domB.remove();
                this.editorDOM.insertBefore(aB ? domA : domB, this.editorDOM.firstChild);
                this.editorDOM.appendChild(aB ? domB : domA);
                this.revertToLeft = !this.revertToLeft;
                if (this.revertDOM)
                    this.revertDOM.textContent = "";
            }
        }
        if ("revertControls" in config || "renderRevertControl" in config) {
            let controls = !!this.revertDOM, toA = this.revertToA, render = this.renderRevert;
            if ("revertControls" in config) {
                controls = !!config.revertControls;
                toA = config.revertControls == "b-to-a";
            }
            if ("renderRevertControl" in config)
                render = config.renderRevertControl;
            this.setupRevertControls(controls, toA, render);
        }
        let highlight = "highlightChanges" in config, gutter = "gutter" in config, collapse = "collapseUnchanged" in config;
        if (highlight || gutter || collapse) {
            let effectsA = [], effectsB = [];
            if (highlight || gutter) {
                let currentConfig = this.a.state.facet(mergeConfig);
                let markGutter = gutter ? config.gutter !== false : currentConfig.markGutter;
                let highlightChanges = highlight ? config.highlightChanges !== false : currentConfig.highlightChanges;
                effectsA.push(configCompartment.reconfigure([
                    mergeConfig.of({ side: "a", sibling: () => this.b, highlightChanges, markGutter }),
                    markGutter ? changeGutter : []
                ]));
                effectsB.push(configCompartment.reconfigure([
                    mergeConfig.of({ side: "b", sibling: () => this.a, highlightChanges, markGutter }),
                    markGutter ? changeGutter : []
                ]));
            }
            if (collapse) {
                let effect = collapseCompartment.reconfigure(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : []);
                effectsA.push(effect);
                effectsB.push(effect);
            }
            this.a.dispatch({ effects: effectsA });
            this.b.dispatch({ effects: effectsB });
        }
        this.scheduleMeasure();
    }
    setupRevertControls(controls, toA, render) {
        this.revertToA = toA;
        this.revertToLeft = this.revertToA == (this.editorDOM.firstChild == this.a.dom.parentNode);
        this.renderRevert = render;
        if (!controls && this.revertDOM) {
            this.revertDOM.remove();
            this.revertDOM = null;
        }
        else if (controls && !this.revertDOM) {
            this.revertDOM = this.editorDOM.insertBefore(document.createElement("div"), this.editorDOM.firstChild.nextSibling);
            this.revertDOM.addEventListener("mousedown", e => this.revertClicked(e));
            this.revertDOM.className = "cm-merge-revert";
        }
        else if (this.revertDOM) {
            this.revertDOM.textContent = "";
        }
    }
    scheduleMeasure() {
        if (this.measuring < 0) {
            let win = (this.dom.ownerDocument.defaultView || window);
            this.measuring = win.requestAnimationFrame(() => {
                this.measuring = -1;
                this.measure();
            });
        }
    }
    measure() {
        updateSpacers(this.a, this.b, this.chunks);
        if (this.revertDOM)
            this.updateRevertButtons();
    }
    updateRevertButtons() {
        let dom = this.revertDOM, next = dom.firstChild;
        let vpA = this.a.viewport, vpB = this.b.viewport;
        for (let i = 0; i < this.chunks.length; i++) {
            let chunk = this.chunks[i];
            if (chunk.fromA > vpA.to || chunk.fromB > vpB.to)
                break;
            if (chunk.fromA < vpA.from || chunk.fromB < vpB.from)
                continue;
            let top = this.a.lineBlockAt(chunk.fromA).top + "px";
            while (next && +(next.dataset.chunk) < i)
                next = rm(next);
            if (next && next.dataset.chunk == String(i)) {
                if (next.style.top != top)
                    next.style.top = top;
                next = next.nextSibling;
            }
            else {
                dom.insertBefore(this.renderRevertButton(top, i), next);
            }
        }
        while (next)
            next = rm(next);
    }
    renderRevertButton(top, chunk) {
        let elt;
        if (this.renderRevert) {
            elt = this.renderRevert();
        }
        else {
            elt = document.createElement("button");
            let text = this.a.state.phrase("Revert this chunk");
            elt.setAttribute("aria-label", text);
            elt.setAttribute("title", text);
            elt.textContent = this.revertToLeft ? "⇜" : "⇝";
        }
        elt.style.top = top;
        elt.setAttribute("data-chunk", String(chunk));
        return elt;
    }
    revertClicked(e) {
        let target = e.target, chunk;
        while (target && target.parentNode != this.revertDOM)
            target = target.parentNode;
        if (target && (chunk = this.chunks[target.dataset.chunk])) {
            let [source, dest, srcFrom, srcTo, destFrom, destTo] = this.revertToA
                ? [this.b, this.a, chunk.fromB, chunk.toB, chunk.fromA, chunk.toA]
                : [this.a, this.b, chunk.fromA, chunk.toA, chunk.fromB, chunk.toB];
            let insert = source.state.sliceDoc(srcFrom, Math.max(srcFrom, srcTo - 1));
            if (srcFrom != srcTo && destTo <= dest.state.doc.length)
                insert += source.state.lineBreak;
            dest.dispatch({
                changes: { from: destFrom, to: Math.min(dest.state.doc.length, destTo), insert },
                userEvent: "revert"
            });
            e.preventDefault();
        }
    }
    /**
    Destroy this merge view.
    */
    destroy() {
        this.a.destroy();
        this.b.destroy();
        if (this.measuring > -1)
            (this.dom.ownerDocument.defaultView || window).cancelAnimationFrame(this.measuring);
        this.dom.remove();
    }
}
function rm(elt) {
    let next = elt.nextSibling;
    elt.remove();
    return next;
}
/**
Get the changed chunks for the merge view that this editor is part
of, plus the side it is on. Or null if the editor isn't part of a
merge view or the merge view hasn't finished initializing yet.
*/
function getChunks(state) {
    let field = state.field(ChunkField, false);
    if (!field)
        return null;
    return { chunks: field, side: state.facet(mergeConfig).side };
}

export { Change, Chunk, MergeView, diff, getChunks, presentableDiff };
