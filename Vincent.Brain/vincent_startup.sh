#!/bin/sh

### BEGIN INIT INFO
# Provides:          vincent_startup.sh
# Required-Start:    $sudo $remote_fs $syslog
# Required-Stop:     $sudo $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start Vincents brain at boot time
# Description:       Starts Vincents brain
### END INIT INFO

# Author: Simon Pfeifhofer <simon.pfeifhofer@gmail.com>

cd /home/pi/Vincent/
node app.js
