#!/bin/sh
# website_installer
# ------------------
# this is a lame script to upload the game into the production enviorement
#
# ------------------
#
# main vars: (you should change this in order to run the installer)
YUIC='/Users/dani/Downloads/yuicompressor-2.4.6/build/yuicompressor-2.4.6.jar'
SSH_HOST='example.com'
SSH_DIR='/var/www/'

#
# stop editing here.. you should be ok the rest.
#

RELEASE='Gunner_'`date +%s`

echo 'copying files...'
cp -R . /tmp/$RELEASE
rm  /tmp/$RELEASE/README.md
rm  /tmp/$RELEASE/website_installer.sh
rm  /tmp/$RELEASE/sv

echo 'compacting index...'
tr -d '\011\012' < /tmp/$RELEASE/index.html > /tmp/$RELEASE/index.html.c
mv /tmp/$RELEASE/index.html.c /tmp/$RELEASE/index.html

echo 'obfuscating css...'
java -jar $YUIC /tmp/$RELEASE/static/css/screen.css -o /tmp/$RELEASE/static/css/screen.css
echo 'obfuscating js...'
java -jar $YUIC /tmp/$RELEASE/static/js/game.js -o /tmp/$RELEASE/static/js/game.js

echo 'setting static versions...'
if [ -f sv ]
then
	SV=(`cat sv`)
	rm sv
else
	SV=(0 0 0 0)
fi

MD5=`md5 -q /tmp/$RELEASE/static/css/screen.css`
if [ "$MD5" != "${SV[0]}" ]
then
	SCREEN_MD5=$MD5
	SCREEN_VER=`expr ${SV[1]} + 1`
	echo "screen.css has changed to $SCREEN_VER"
else
	SCREEN_MD5=${SV[0]}
	SCREEN_VER=${SV[1]}
fi

MD5=`md5 -q /tmp/$RELEASE/static/js/game.js`
if [ "$MD5" != "${SV[2]}" ]
then
	GAME_MD5=$MD5
	GAME_VER=`expr ${SV[3]} + 1`
	echo "game.js has changed to $GAME_VER"
else
	GAME_MD5=${SV[2]}
	GAME_VER=${SV[3]}
fi

echo 'writing website config...'
echo "$SCREEN_MD5 $SCREEN_VER $GAME_MD5 $GAME_VER" > sv
sed -i '' -e "s/static\/css\/screen.css\?1/static\/css\/screen.css\?$SCREEN_VER/g" /tmp/$RELEASE/index.html
sed -i '' -e "s/static\/js\/game.js\?1/static\/js\/game.js\?$GAME_VER/g" /tmp/$RELEASE/index.html

#for local install to gh_pages
#rm -rf ../GunnerRelease/*
#cp -R /tmp/$RELEASE/* ../GunnerRelease/
#rm -rf /tmp/$RELEASE
#exit 1

echo "compressing package..."
tar --exclude=".*" -jcf /tmp/$RELEASE.tbz -C /tmp/ $RELEASE

echo "sending package..."
scp /tmp/$RELEASE.tbz $SSH_HOST:$SSH_DIR$RELEASE.tbz
echo "installing the package..."
ssh $SSH_HOST "cd $SSH_DIR && tar -jxf $RELEASE.tbz && rm $RELEASE.tbz && mkdir -p Gunner && rm -rf Gunner && mv $RELEASE Gunner"

echo "cleaning up..."
rm -rf /tmp/$RELEASE
rm -f /tmp/$RELEASE.tbz

echo "The site is up!"
