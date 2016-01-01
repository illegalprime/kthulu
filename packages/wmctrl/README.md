# Depdendencies

This package requires you to have the 'wmctrl' package installed.


# Features

Currently the only supported API is focusing windows.
You simply call this meteor method like so to focus a window:

```javascript
Meteor.call("wmctrl", {
    focus: {
        matches: "Netflix"
    },
}, function() {
    // Action finished!
});
```
