# Home Server

## Bind9

Disable systemd-resolved service

$ sudo systemctl disable systemd-resolved.service
$ sudo service systemd-resolved stop
$ sudo rm /etc/resolv.conf
