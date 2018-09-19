rm -rf build_plugin.zip #
mkdir ./build_plugin #
#
cp ../extension/manifest.json  ./build_plugin/manifest.json #
cp ../extension/icon16.png     ./build_plugin/icon16.png #
cp ../extension/icon128.png    ./build_plugin/icon128.png #
cp ../extension/newtab.html    ./build_plugin/newtab.html #
#
java -jar GoogleCompiler.jar --js=../extension/content.js --js_output_file=./build_plugin/content.js #
java -jar GoogleCompiler.jar --js=../extension/main.js --js_output_file=./build_plugin/main.js #
java -jar GoogleCompiler.jar --js=../extension/versionlog.js --js_output_file=./build_plugin/versionlog.js #
#
zip -r build_plugin.zip ./build_plugin #
#
rm -rf ./build_plugin #
#
