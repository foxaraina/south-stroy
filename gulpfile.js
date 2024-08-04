
let gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    debug = require('gulp-debug'),
    browserSync = require('browser-sync').create(),
    watch = require('gulp-watch'),
    path = require('path'),
    fs = require('fs'),
    rename = require('gulp-rename'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    webp = require('imagemin-webp'),
    extReplace = require('gulp-ext-replace'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js').createConfig,
    sass = require('gulp-sass')(require('sass')),
    sassVariables = require('gulp-sass-variables'),
    cached = require('gulp-cached'),
    dependents = require('gulp-dependents'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),

    clean = require('gulp-clean'),

    pug = require('gulp-pug'),
    emitty = require('emitty').setup('src', 'pug'),
    data = require('gulp-data'),

    // critical = require('critical').stream,

    svgstore = require('gulp-svgstore');


/** BUILD **/

/*gulp.task('build:fonts', () => {
    return gulp.src('src/fonts/!*.*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(debug({title: 'fonts copy'}));
});*/

// gulp.task('remote-deploy', () => {
//     let conn = getFtpConnection();
//
//     return gulp.src(['./dist/**/*'], {base: './dist/', buffer: false})
//         .pipe(conn.newer('/'))
//         .pipe(conn.dest('/'))
// })

gulp.task('sass:compile', () => {
    return buildStyles()
        .pipe(browserSync.stream());
});

gulp.task('sass:compile:prod', () => {
    return buildStyles(true);
});

gulp.task('sass:clean', () => {
    return gulp.src('./dist/blocks', {read: false, allowEmpty: true})
        .pipe(clean());
});

gulp.task('sass', gulp.series(
    'sass:compile',
    'sass:clean'
));

gulp.task('build:img', () => {
    return gulp.src(['src/img/**/*.*', '!src/img/**/*.pug'])
        .pipe(gulp.dest('dist/img'))
        .pipe(debug({title: 'img copy'}));
});

gulp.task('build:json', () => {
    return gulp.src(['src/data/*.*'])
        .pipe(gulp.dest('dist/data'))
        .pipe(debug({title: 'json copy'}));
});

gulp.task('build:fonts', () => {
    return gulp.src(['src/fonts/*.*'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe(debug({title: 'fonts copy'}));
});

gulp.task('build:images', () => {
    return gulp.src('src/blocks/*/images/*.*')
        .pipe(plumber())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./dist/images'))
        .pipe(debug({title: 'images copy', showCount: false}));
});

gulp.task('build:webp-img', function () {
    let src = 'src/img/**/*.{jpg,jpeg,png}';
    let dest = 'dist/img';

    return gulp.src(src)
        .pipe(plumber())
        // .pipe(rename({dirname: ''}))
        .pipe(imagemin([
            webp({
                quality: 65
            })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest(dest))
        .pipe(debug({title: 'webp img build', showCount: false}));
});

gulp.task('build:markup', () => {
    return buildMarkup('src/pages/*.pug');
});

gulp.task('build:sprite', () => {
    return svgSprite();
})

gulp.task('build:styles', gulp.series(
    'sass:compile',
    'sass:clean'
));

gulp.task('build:styles:prod', gulp.series(
    'sass:compile:prod'
));

gulp.task('build:scripts', (done) => {
    webpack(webpackConfig('development', 'build')).run((err, stats) => {
        buildScripts(err, stats, done);
    });
});

gulp.task('build:scripts:prod', (done) => {
    webpack(webpackConfig('production', 'build')).run((err, stats) => {
        buildScripts(err, stats, done);
    });
});

gulp.task('build', gulp.series(
    //'build:fonts',
    'build:webp-img',
    'build:img',
    'build:json',
    'build:fonts',
    // 'build:webp-images',
    'build:images',
    'build:markup',
    'build:styles',
    'build:scripts',
    'build:sprite'
));

gulp.task('build:prod', gulp.parallel(
    'build:styles:prod',
    'build:scripts:prod'
));

gulp.task('prod', gulp.series(
    'build:prod',
));

/** WATCH **/

gulp.task('watch:images', () => {
    return watch('src/blocks/*/images/*.*', (file) => {
        if (file.event === 'add' || file.event === 'change') {
            imageMin(file.path);
        } else if (file.event === 'unlink') {
            fs.unlink(path.resolve('dist/images/' + path.basename(file.path)), (err) => {
            });
        }
    });
});

/** Отслеживание изменений в .pug **/
gulp.task('watch:markup', () => {
    return watch('src/pages/*.pug', (file) => {
        return buildMarkup(file.path)
            .pipe(browserSync.stream());
    });
});

gulp.task('watch:markup:blocks', () => {
    return watch('src/blocks/*/*.pug', () => {
        return buildMarkupWithCache()
            .pipe(browserSync.stream());
    });
});

gulp.task('watch:markup:template', () => {
    return watch('src/template/*.pug', () => {
        return buildMarkupWithCache()
            .pipe(browserSync.stream());
    });
});

gulp.task('watch:styles', () => {
    return watch('src/scss/**/*.scss', gulp.series(
        'sass:compile',
        'sass:clean'
    ));
});

gulp.task('watch:styles:blocks', () => {
    return watch('src/blocks/**/style.scss', gulp.series(
        'sass:compile',
        'sass:clean'
    ));
});

gulp.task('watch:scripts', function () {
    webpack(webpackConfig('development', 'watch')).watch({
        aggregateTimeout: 100,
        poll: false,
        ignored: ['node_modules']
    }, buildScripts);
});

gulp.task('watch', gulp.parallel(
    'watch:images',
    'watch:markup',
    'watch:markup:blocks',
    'watch:markup:template',
    'watch:scripts',
    'watch:styles',
    'watch:styles:blocks'
));

gulp.task('webserver', (done) => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        tunnel: false,
        host: '',
        port: 3000,
        logPrefix: 'template'
    });

    done();
});

gulp.task('imagemin', () => {
    return imageMin('src/blocks/*/images/*.*');
});

/** Действия по умолчанию при запуске gulp **/
gulp.task('default', gulp.parallel('watch', 'webserver'));

function imageMin(files) {
    return gulp.src(files, {base: './'})
        .pipe(plumber())
        .pipe(debug({title: 'image min'}))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false,
                    collapseGroups: true
                }]
            })
        ]))
        .pipe(gulp.dest('./'))
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./dist/images'));
}

function buildSprite(files) {
    return gulp.src(files)
        .pipe(plumber())
        .pipe(pug({pretty: '    '}))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/img'))
        .pipe(debug({title: 'build'}));
}

function buildMarkup(files) {
    return gulp.src(files)
        .pipe(plumber())
        .pipe(pug({pretty: '    '}))
        .pipe(gulp.dest('dist'))
        .pipe(debug({title: 'build'}));
}

function buildMarkupWithCache() {
    return gulp.src('src/pages/*.pug')
        .pipe(plumber())
        .pipe(emitty.stream())
        .pipe(pug({pretty: '    '}))
        .pipe(gulp.dest('dist'))
        .pipe(debug({title: 'build', showCount: false}))
}

function buildStyles() {
    let files = [
        'src/scss/main.scss'
    ];

    files.push('src/scss/pages/*.scss');
    files.push('src/scss/blocks/**/*.scss');


    return gulp.src(files, {base: './src/scss/'})
        .pipe(plumber())
        .pipe(dependents())
        .pipe(sass({
            outputStyle: 'expanded',
            sourceMap: false,
            errLogToConsole: true
        }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest('dist/css'))
        .pipe(debug({title: 'scss build', showCount: false}))
}

function buildScripts(err, stats, done) {
    let errors = stats.compilation.errors;

    if (err) throw new gutil.PluginError('webpack', err);

    if (errors.length > 0) {
        notify.onError({
            title: 'Webpack Error',
            message: '<%= error.message %>',
            sound: 'Submarine'
        }).call(null, errors[0]);
    }

    browserSync.reload();

    if (typeof done === 'function') done();
}

function svgSprite() {
    return gulp.src('src/img/sprite/*.svg')
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('dist/img'))
}
