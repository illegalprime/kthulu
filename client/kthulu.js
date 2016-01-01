var modules = [
    {
        href: "/",
        template: "home",
        title: "Movies & TV",
    },
    {
        href: "/xboxdrv",
        template: "xboxdrv",
        title: "Switch XBox Modes",
    },
    {
        href: "/apps",
        template: "apps_overview",
        title: "Switch Apps",
    },
];

_.each(modules, function(module) {
    Router.route(module.href, function() {
        this.render(module.template);
    });
});

Template.sidenav.helpers({
    links: function() {
        return modules;
    },
});

Template.lone_menu.onRendered(function() {
    this.$("i.show-menu").sideNav({
        edge: "right",
        closeOnClick: true,
    });
});
