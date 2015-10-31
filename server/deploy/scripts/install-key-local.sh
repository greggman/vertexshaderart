#!/bin/sh
DOCKER="$1"
ssh -oBatchMode=yes $DOCKER 'ls' 2>/dev/null
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "need to install ssh key in docker VM"
  cat ~/.ssh/id_rsa.localdocker.pub | ssh $DOCKER 'cat >> .ssh/authorized_keys'
fi

