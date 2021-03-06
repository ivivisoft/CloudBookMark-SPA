/**
 * Created by aresn on 16/6/20.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import App from 'components/app.vue'
import Routers from './router'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import VueResource from 'vue-resource'
import Config from './config/Config'
import server from './config/api'

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(iView);

// Vuex定义
const store = new Vuex.Store({
	state: {
		isLogin: false,
		user: {},
		access_token: ''
	},
	mutations: {
		setAccessToken(state, access_token) {
			state.access_token = access_token;
		},
		login(state) {
			state.isLogin = true;
		},
		logout(state) {
			state.isLogin = false;
			state.user = {};
			state.access_token = '';
		},
		setUser(state, user) {
			state.user = user;
		}
	}
});

// 开启debug模式
Vue.config.debug = true;

// 路由配置
const router = new VueRouter({
    // 是否开启History模式的路由,默认开发环境开启,生产环境不开启。如果生产环境的服务端没有进行相关配置,请慎用
    history: Config.env != 'production'
    //history: false
});

router.map(Routers);
 
router.beforeEach(({to, next, redirect}) => {
    // 还原滚动条
    window.scrollTo(0, 0);
    // Auth验证
    if (to.auth) {
    	if (!store.state.isLogin) {
    		if (localStorage.access_token) {
    			// 自动登录
    			store.commit('setAccessToken', localStorage.access_token);
    			store.commit('login');
    			// 获取用户信息
    			Vue.http.get(server.api.user, {
    				headers: {
    					'Authorization': 'Bearer ' + store.state.access_token
    				}
    			}).then((response) => {
    				store.commit('setUser', response.body.data);
    			}, (error) => {
    				redirect({name: 'login'});
    			});
    			return true;
    		}
    		redirect({name: 'login'});
    	}
    }
    return true;
});

router.redirect({
    '*': '/'
});

// 绑定Vuex
App.store = store;

router.start(App, '#app');