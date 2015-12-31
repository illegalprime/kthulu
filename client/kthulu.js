var modules = [
    {
        href: "/",
        template: "home",
        title: "Movies & TV",
    },
    {
        href: "/xboxdrv",
        template: "xboxdrv",
        title: "XBox Controller Setup",
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
