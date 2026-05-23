import { createStore } from 'vuex'

export default createStore({
    state: {
        user: {
            token: localStorage.getItem('student_token') || localStorage.getItem('teacher_token') || '',
            userInfo: JSON.parse(
                localStorage.getItem('student_userInfo') ||
                localStorage.getItem('teacher_userInfo') ||
                '{}'
            )
        }
    },
    getters: {
        isLoggedIn: state => !!state.user.token,
        userInfo: state => state.user.userInfo,
        username: state => state.user.userInfo.username || ''
    },
    mutations: {
        SET_TOKEN(state, token) {
            state.user.token = token
        },
        SET_USER_INFO(state, userInfo) {
            state.user.userInfo = userInfo
        },
        LOGOUT(state) {
            state.user.token = ''
            state.user.userInfo = {}
        }
    },
    actions: {
        login({ commit }, { token, userInfo }) {
            commit('SET_TOKEN', token)
            commit('SET_USER_INFO', userInfo)
        },
        logout({ commit }) {
            commit('LOGOUT')
        }
    }
})
