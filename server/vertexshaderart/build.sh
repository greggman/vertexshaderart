#!/bin/sh
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

cd "$SCRIPTPATH"

meteor build ../.build --directory --architecture=os.linux.x86_64
