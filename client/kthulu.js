var modules = [
    {
        href: "/",
        template: "home",
        title: "Movies & TV",
    },
    {
        href: "/system-management",
        template: "system_manager",
        title: "Manage System",
    },
    {
        href: "/apps",
        template: "apps_overview",
        title: "Apps",
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
        menuWidth: 400,
        closeOnClick: true,
    });
});

Template.main_bar.onRendered(function() {
    this.$("i.show-menu").sideNav({
        edge: "right",
        menuWidth: 400,
        closeOnClick: true,
    });
});

Template.main_bar.events({
    "blur input.search_text": function(event, self) {
        self.$(".material-icons").removeClass("active");
        self.$(".input-field").removeClass("active");
    },
    "click i.clear-search": function(event, self) {
        self.$("input.search_text").val("");
        self.$("input.search_text").focus();
    },
    "click i.do-search": function(event, self) {
        self.$("input.search_text").focus();
    },
    "focus input.search_text": function(event, self) {
        self.$(".input-field").addClass("active");
    },
});
