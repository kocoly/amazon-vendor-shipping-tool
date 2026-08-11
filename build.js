const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

async function runBuild() {
    try {
        // 1. 检查源码路径是否存在
        const srcHtmlPath = path.join(__dirname, 'src/index.html');
        const srcAppPath = path.join(__dirname, 'src/app.js');

        if (!fs.existsSync(srcHtmlPath) || !fs.existsSync(srcAppPath)) {
            throw new Error(`找不到源码文件，请确保 src/index.html 和 src/app.js 存在于项目根目录下！`);
        }

        // 2. 清理并创建 dist 目录
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true, force: true });
        }
        fs.mkdirSync('dist');

        // 3. 执行 esbuild 打包
        await esbuild.build({
            entryPoints: ['src/app.js'],
            bundle: true,
            minify: true,
            sourcemap: true,
            target: ['es2020'],
            outfile: 'dist/app.min.js',
        });

        // 4. 处理并复制 HTML
        let html = fs.readFileSync(srcHtmlPath, 'utf8');
        html = html.replace('src/app.js', 'app.min.js');
        fs.writeFileSync(path.join(__dirname, 'dist/index.html'), html);

        console.log('⚡ [Success] 构建完成！已成功输出至 dist/ 目录。');
    } catch (error) {
        console.error('❌ [Error] 构建步骤抛出错误:');
        // 如果是 esbuild 专有的编译错误，打印详细的 errors 数组
        if (error.errors && error.errors.length > 0) {
            console.error(JSON.stringify(error.errors, null, 2));
        } else {
            console.error(error.message || error);
        }
        process.exit(1);
    }
}

runBuild();
