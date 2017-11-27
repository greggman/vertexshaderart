#!/bin/sh
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

cd "$SCRIPTPATH"

../vertexshaderart/build.sh
