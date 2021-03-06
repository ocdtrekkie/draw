#!/bin/sh

#Move to the folder where ep-lite is installed
cd `dirname $0`

#Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

#Is gnu-grep (ggrep) installed on SunOS (Solaris)
if [ $(uname) = "SunOS" ]; then
  hash ggrep > /dev/null 2>&1 || { 
    echo "Please install ggrep (pkg install gnu-grep)" >&2
    exit 1 
  }
fi

#Is wget installed?
hash curl > /dev/null 2>&1 || { 
  echo "Please install curl" >&2
  exit 1 
}

#Is node installed?
hash node > /dev/null 2>&1 || { 
  echo "Please install node.js ( http://nodejs.org )" >&2
  exit 1 
}

#Is npm installed?
hash npm > /dev/null 2>&1 || { 
  echo "Please install npm ( http://npmjs.org )" >&2
  exit 1 
}

#Get the name of the settings file
settings="settings.json"
a='';
for arg in $*; do
  if [ "$a" = "--settings" ] || [ "$a" = "-s" ]; then settings=$arg; fi
  a=$arg
done

#Does a $settings exist? if no copy the template
if [ ! -f $settings ]; then
  echo "Copy the settings template to $settings..."
  cp settings.json.template $settings || exit 1
fi

echo "Ensure that all dependencies are up to date..."
(
  npm install --loglevel warn
  npm install sqlite3
)

#echo "Ensure jQuery is downloaded and up to date..."
#DOWNLOAD_JQUERY="true"
#NEEDED_VERSION="1.7.1"
#if [ -f "src/static/js/jquery.js" ]; then
#  if [ $(uname) = "SunOS" ]; then
#    VERSION=$(cat src/static/js/jquery.js | head -n 3 | ggrep -o "v[0-9]\.[0-9]\(\.[0-9]\)\?");
#  else
#    VERSION=$(cat src/static/js/jquery.js | head -n 3 | grep -o "v[0-9]\.[0-9]\(\.[0-9]\)\?");
#  fi
#
#  if [ ${VERSION#v} = $NEEDED_VERSION ]; then
#    DOWNLOAD_JQUERY="false"
#  fi
#fi
#
#if [ $DOWNLOAD_JQUERY = "true" ]; then
#  curl -lo src/static/js/jquery.js http://code.jquery.com/jquery-$NEEDED_VERSION.js || exit 1
#fi

exit 0

