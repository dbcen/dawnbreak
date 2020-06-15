const routes = [
    { path: '*',redirect: '/home'},
    { path: '/home',name:"home",meta: { title: "Dawn contract"}, component: window.Home},
    { path: '/authorize',name:"authorize",meta: { title: "Authorize" }, component: window.Authorize},
    { path: '/team',name:"team",meta: { title: "My team" }, component: window.Team},
    { path: '/leaderboard',name:"leaderboard",meta: { title: "Previous awards" }, component: window.Leaderboard},
];
window.router = new VueRouter({
  	routes 
});

window.router.afterEach((to, from) => {
    document.title = to.meta.title;
})