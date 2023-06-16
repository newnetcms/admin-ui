import Snotify from 'vue-snotify';
import EventBus from "./EventBus";

Vue.use(Snotify);

Vue.prototype.EventBus = EventBus;

Vue.prototype.showError = function (msg, options) {
    return this.$snotify.error(msg, Object.assign({
        timeout: 3000,
        showProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false
    }, options));
};

Vue.prototype.showSuccess = function (msg, options) {
    return this.$snotify.success(msg, Object.assign({
        timeout: 3000,
        showProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false
    }, options));
};

Vue.prototype.showInfo = function (msg, options) {
    return this.$snotify.info(msg, Object.assign({
        timeout: 3000,
        showProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false
    }, options));
};

Vue.prototype.showWarning = function (msg, options) {
    return this.$snotify.warning(msg, Object.assign({
        timeout: 3000,
        showProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false
    }, options));
};

Vue.prototype.calcDiscount = function (originPrice, salePrice) {
    if (originPrice && salePrice && originPrice > salePrice) {
        return Math.round((1 - salePrice / originPrice) * 100);
    }

    return 0;
}

Vue.filter('price', function (value) {
    value = Number(value);

    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
});
