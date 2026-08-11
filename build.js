const esbuild = require('esbuild');
const fs = require('fs-extra');

async function runBuild() {
    try {
        // 1. 清理并重建 dist 输出目录
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true, force: true });
        }
        fs.mkdirSync('dist');

        // 2. 打包并压缩 src/app.js 为 dist/app.min.js
        await esbuild.build({
            entryPoints: ['src/app.js'],
            bundle: true,
            minify: true,
            sourcemap: true,
            target: ['es2020'],
            outfile: 'dist/app.min.js',
        });

        // 3. 读取 src/index.html，修改引用路径后输出到 dist/index.html
        let html = fs.readFileSync('src/index.html', 'utf8');
        html = html.replace('src/app.js', 'app.min.js');
        fs.writeFileSync('dist/index.html', html);

        console.log('⚡ [Success] Amazon Vendor 工具构建完成！已输出至 dist/ 目录。');
    } catch (error) {
        console.error('❌ [Error] 构建失败:', error);
        process.exit(1);
    }
}

runBuild();
