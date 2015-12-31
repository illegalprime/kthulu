
# xboxdrv

This package controls the xboxdrv program through its dbus interface.
The command to start xboxdrv should be something like:
```
sudo xboxdrv \
    --silent \
    --mimic-xpad-wireless \
    --daemon \
    --detach \
    --pid-file /var/run/xboxdrv.pid \
    --detach-kernel-driver \
    --dbus session
```

## sudo Setup

This package uses some root commands, to set it up
edit your sudoers file with visudo:

```
michael localhost = (root) NOPASSWD: /usr/bin/xboxdrv --silent --detach-kernel-driver --mouse
michael localhost = (root) NOPASSWD: /usr/bin/xboxdrv --silent --detach-kernel-driver --mimic-xpad-wireless
```
