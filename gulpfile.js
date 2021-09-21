var gulp = require('gulp'), // gulp
	sass = require('gulp-sass'), // sass
	autoprefixer = require('gulp-autoprefixer'), // 브라우저 새로고침
	fileinclude = require('gulp-file-include'), // html
	concat = require('gulp-concat'), // 합치기
	jshint = require('gulp-jshint'), // 코드문법 검사
	uglify = require('gulp-uglify'), // js 최적화
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'), // scss코드 실제 경로(개발자모드)를 추적
	babel = require('gulp-babel'),
	wait = require('gulp-wait'),

	pipeline = require('readable-stream').pipeline,
	browserSync = require('browser-sync').create();

var paths = {
	src: './src',
	dist: './dist',

	DistCss: './dist/css',
	DistJs: './dist/js',
	DistFonts: './dist/fonts',
	DistImg: './dist/img',
	DistLib: './dist/lib',
	DistVendor: './dist/plugin',

	views: './src/views',
	scss: './src/scss',
	js: './src/js',
	lib: './src/lib',
	vendor: './src/plugin',
	production: './src/views/productions',

	node: './node_modules'
};

// jQuery 설치
gulp.task('copy_assets', () => {

	gulp.src(paths.node + '/font-awesome/fonts/*.{ttf,woff,woff2,eot,svg}')
		.pipe(gulp.dest(paths.DistFonts));

	gulp.src(paths.node + '/simple-line-icons/fonts/*')
		.pipe(gulp.dest(paths.DistFonts));

	return pipeline(
		gulp.src(paths.node + '/jquery/dist/*'),
		gulp.dest(paths.DistLib + '/jquery')
	);
});

// html
gulp.task('htmlinclude', () => {
	return pipeline(
		gulp.src([
			paths.production + '/*.html',
			paths.production + '/*/*.html',
			paths.production + '/*/*/*.html',
			paths.production + '/*/*/*/*.html',
			paths.production + '/*/*/*/*/*.html'
		]),
		fileinclude({
			prefix: '@@',
			basepath: '@file'
		}),
		gulp.dest(paths.dist)
	);
});

// sass
gulp.task('sass', () => {
	return pipeline(
		gulp.src([
			paths.scss + '/*.scss'
		])
			.pipe(wait(1000))
			.pipe(sass({
				outputStyle: 'expanded',
				indentType: 'space',
				indentWidth: 2
			}).on('error', sass.logError))
			.pipe(autoprefixer({
				browsers: ['last 10 versions']
			}))
			.pipe(gulp.dest(paths.DistCss)),
		sourcemaps.init(),
		sourcemaps.write('.'),
	);
});

// 모든 플러그인 css
gulp.task('pluginCss', () => {
	return pipeline(
		gulp.src([
			//node plugin
			paths.node + '/bootstrap/dist/css/bootstrap.css',
			paths.node + '/bootstrap-toggle/css/bootstrap-toggle.min.css',
			paths.node + '/font-awesome/css/font-awesome.css',
			paths.node + '/simple-line-icons/css/simple-line-icons.css',
			paths.node + '/perfect-scrollbar/css/perfect-scrollbar.css',
			paths.node + '/bootstrap-daterangepicker/daterangepicker.css',
			paths.node + '/pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.min.css',

			//plugin
			paths.vendor + '/*.css',
			paths.vendor + '/*/*.css',
			paths.vendor + '/*/*/*.css'
		]),
		concat('vendor.css'),
		rename('vendor.min.css'),
		gulp.dest(paths.DistVendor)
	);
});

// js 문법검사
gulp.task('jshint', () => {
	return pipeline(
		gulp.src(paths.js + '/*.js'),
		jshint({
			esversion: 6
		}),
		jshint.reporter('default')
	);
});

// js
gulp.task('js', () => {
	return pipeline(
		gulp.src(paths.js + '/*.js'),
		sourcemaps.init(),
		babel({
			presets: ['es2015'] // preset 'es2015'javascript5로
		}),
		sourcemaps.write('./', { sourceRoot: '../src' }),
		gulp.dest(paths.DistJs)
	);
});

// 모든 플러그인 js
gulp.task('pluginJs', () => {
	return pipeline(
		gulp.src([
			//node plugin
			paths.node + '/perfect-scrollbar/dist/perfect-scrollbar.min.js',
			paths.node + '/popper.js/dist/umd/popper.js',
			paths.node + '/jquery-validation/dist/jquery.validate.min.js',
			paths.node + '/moment/min/moment.min.js',
			paths.node + '/moment/locale/ko.js',
			paths.node + '/bootstrap/dist/js/bootstrap.js',
			paths.node + '/bootstrap-toggle/js/bootstrap-toggle.min.js',
			paths.node + '/bootstrap-daterangepicker/daterangepicker.js',
			paths.node + '/pc-bootstrap4-datetimepicker/build/js/bootstrap-datetimepicker.min.js',

			//plugin
			paths.vendor + '/*.js',
			paths.vendor + '/*/*.js',
			paths.vendor + '/*/*/*.js'
		]),
		concat('vendor.js'),
		uglify({
			mangle: false,
			preserveComments: 'all'
			// 'all', 또는 'some' 압축과정에서 주석이 지워지지 않고 보존 
			// 'all' 값일 경우에는 모든 주석이 보존되고 'some' 값일 때는 느낌표(!)가 붙은 주석만 보존
		}),
		rename('vendor.min.js'),
		gulp.dest(paths.DistVendor)
	);
});


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var tasks = ['copy_assets', 'htmlinclude', 'jshint', 'js', 'sass', 'pluginCss', 'pluginJs'];

var main = () => {

	// Run server
	browserSync.init({
		server: "./dist"
	});

	// Run registerd tasks
	gulp.watch([
		paths.views + '/*.html',
		paths.views + '/*/*.html',
		paths.views + '/*/*/*.html',
		paths.views + '/*/*/*/*.html',
		paths.views + '/*/*/*/*/*.html',
	], {
		cwd: './'
	}, ['htmlinclude']);

	//watch scss
	gulp.watch([
		paths.scss + '/*.scss',
		paths.scss + '/*/*.scss',
		paths.scss + '/*/*/*.scss'
	], {
		cwd: './'
	}, ['sass']);

	//watch js
	gulp.watch([paths.js + '/*.js'], {
		cwd: './'
	}, ['js']);

	// Hot reload
	gulp.watch([
		paths.dist + '/*.html',
		paths.DistCss + '/*.css',
		paths.DistJs + '/*.js'
	]).on('change', browserSync.reload);

};

gulp.task('default', tasks, main);
gulp.task('watch', tasks, main);