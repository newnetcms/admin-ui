import lang from 'element-ui/lib/locale/lang/vi';
import locale from 'element-ui/lib/locale';
import {
    Tree,
    Loading
} from 'element-ui';

locale.use(lang);

Vue.use(Tree);

Vue.use(Loading.directive);
