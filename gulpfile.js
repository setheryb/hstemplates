// package vars
const gulp = require('gulp'),
			pkg = require('./package.json'),
			env = require('dotenv').config(),
			favicons = require('favicons').stream,
			rename = require('gulp-rename');

const { series, parallel } = require('gulp');

const $ = require('gulp-load-plugins')({
	pattern: ['*'],
	scope: ['devDependencies']
});

const onError = (err) => {
	console.log(err);
};

let statVers = null;
let stageStatVers = null;
let prodStatVers = null;
// let publisherDev = $.awspublish.create({
// 	region: process.env.SPACES_REGION,
// 	params: {
// 		Bucket: process.env.SPACES_BUCKET,
// 		acl: 'public-read',
// 	},
// 	accessKeyId: process.env.SPACES_API_KEY,
// 	secretAccessKey: process.env.SPACES_SECRET,
// 	endpoint: process.env.SPACES_REGION + '.digitaloceanspaces.com'
// });

const banner = [
	'/**',
	' * @project				<%= pkg.name %>',
	' * @author				 <%= pkg.author %>',
	' * @copyright			Copyright (c) ' + $.moment().format('YYYY') + ', <%= pkg.copyright %>',
	' * @build					' + $.moment().format('llll') + ' ET',
	' *',
	' */',
	''
].join('\n');

// Path variables
const paths = {
	src: {
		base: './site/',
		css: './site/css/',
		js: './site/js/',
		img: './site/images/',
		scss: './site/scss/',
		cdn: './web/assets/'
	},
	dist: {
		base: './web/',
		css: './web/assets/css/',
		js: './web/assets/js/',
		img: './web/assets/images/'
	},
	build: {
		base: './build/',
		css: './build/css/',
		js: './build/js/',
		img: './build/images/'
	},
	favicon: {
		src: './site/images/favicon_src.png',
		dest: './web/',
		path: '/images/site/'
	},
	markup: {
		src: ['./templates/**/*.+(html|htm|twig)','./web/training-needs-assessment/**/*.+(php)','./web/**/*.+(php)',]

	},
	templates: './web/**/*.+(php)',
	img: {
		src: './site/images/**/*.+(png|jpg|jpeg|gif|svg|webp)',
		dev: './web/assets/images',
		dest: './web/assets/images'
	},
	scss: [],
	configLoc: './config'
}

var vars = {
	siteCssName: 'styles.min.css',
	scssName: 'style.scss',
	cssName: 'style.css',
}

var univ = {
	distCss: [
		'./node_modules/eric-meyer-reset/eric-meyer-reset.css',
		'./node_modules/jquery-modal/jquery.modal.css',
		'./build/css/**/*.css',
		'./src/css/*.css'
	],
	distJs: [
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/jquery-modal/jquery.modal.js',
		//'./node_modules/createjs/builds/1.0.0/createjs.js',
		'./build/js/*.js',
		'./node_modules/lazysizes/lazysizes.min.js',
		'./node_modules/lazysizes/plugins/bgset/ls.bgset.min.js',
		'./node_modules/picturefill/dist/picturefill.min.js'
	],
	babelJs: [
		'./site/js/*.js'
	],
	inlineJs: [
		'./node_modules/fg-loadcss/dist/loadCSS.js',
		'./node_modules/fg-loadcss/dist/cssrelpreload.js',
		'./node_modules/fontfaceobserver/fontfaceobserver.js',
		'./node_modules/loadjs/dist/loadjs.min.js',
		'./node_modules/tiny-cookie/dist/tiny-cookie.min.js'
		// './src/js/register-service-worker.js',
		// './src/js/asyncload-blog-fonts.js',
		// './src/js/asyncload-site-fonts.js'
	],
	siteIcon: './web/favicon.*'
}

// ///////////////////////////////////////////////////////////////////////
// Development Tasks
// ///////////////////////////////////////////////////////////////////////

// scss - build the scss to the build folder, including the required paths, and writing out a sourcemap
function scss() {
	$.fancyLog('-> Compiling SCSS');
	return gulp.src(paths.src.scss + '**/*.scss')
	.pipe($.plumber({errorHandler: onError}))
	.pipe($.sourcemaps.init({loadMaps: true}))
	.pipe($.sass({ includePaths: paths.scss })
		.on('error', $.sass.logError))
	.pipe($.cached('sass_compile'))
	.pipe($.autoprefixer({
		grid: 'autoplace'
	}))
	.pipe($.sourcemaps.write('./'))
	.pipe($.size({gzip: true, showFiles: true}))
	.pipe(gulp.dest(paths.build.css));
}

// css task - combine & minimize any distribution CSS into the public css folder, and add our banner to it
function css() {
	$.fancyLog('-> Building CSS');
	return gulp
		.src(univ.distCss)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: paths.dist.css + vars.siteCssName}))
		.pipe($.print.default())
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.concat(vars.siteCssName))
		.pipe($.cssnano({
			discardComments: {
				removeAll: true
			},
			discardDuplicates: true,
			discardEmpty: true,
			minifyFontValues: true,
			minifySelectors: true
        }))
		.pipe($.header(banner, {pkg: pkg}))
		.pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(paths.dist.css))
		.pipe($.filter('**/*.css'))
		.pipe($.livereload());
}

// scss - build the scss to the build folder, including the required paths, and writing out a sourcemap
function scssBuild() {
	$.fancyLog('-> Compiling SCSS');
	return gulp.src(paths.src.scss + '**/*.scss')
	.pipe($.plumber({errorHandler: onError}))
	// .pipe($.sourcemaps.init({loadMaps: true}))
	.pipe($.sass({ includePaths: paths.scss })
		.on('error', $.sass.logError))
	.pipe($.cached('sass_compile'))
	.pipe($.autoprefixer({
		grid: 'autoplace'
	}))
	// .pipe($.sourcemaps.write('./'))
	.pipe($.size({gzip: true, showFiles: true}))
	.pipe(gulp.dest(paths.build.css));
}

// css task - combine & minimize any distribution CSS into the public css folder, and add our banner to it
function cssBuild() {
	$.fancyLog('-> Building CSS');
	return gulp
		.src(univ.distCss)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: paths.dist.css + vars.siteCssName}))
		.pipe($.print.default())
		// .pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.concat(vars.siteCssName))
		.pipe($.cssnano({
			discardComments: {
				removeAll: true
			},
			discardDuplicates: true,
			discardEmpty: true,
			minifyFontValues: true,
			minifySelectors: true
				}))
		.pipe($.header(banner, {pkg: pkg}))
		// .pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(paths.dist.css))
		.pipe($.filter('**/*.css'))
		.pipe($.livereload());
}

// babel js task - transpile our Javascript into the build directory
function jsBabel() {
	$.fancyLog('-> Transpiling Javascript via Babel...');
	return gulp.src(univ.babelJs)
	.pipe($.plumber({errorHandler: onError}))
	.pipe($.newer({dest: paths.build.js}))
	.pipe($.babel())
	.pipe($.size({gzip: true, showFiles: true}))
	.pipe(gulp.dest(paths.build.js));
}

function jsCombine() {
	$.fancyLog('-> Combining Javascript...');
	return gulp.src(univ.distJs)
		.pipe($.concat('sitescripts.js'))
		.pipe(gulp.dest(paths.dist.js))
		.pipe($.rename('sitescripts.min.js'))
		.pipe($.uglify({mangle: false}))
		.pipe(gulp.dest(paths.dist.js));
}

// inline js task - minimize the inline Javascript into _inlinejs in the templates path
function jsInline() {
	$.fancyLog('-> Copying inline js');
	return gulp.src(univ.inlineJs)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.if(['*.js', '!*.min.js'],
			$.newer({dest: paths.templates + '_inlinejs', ext: '.min.js'}),
			$.newer({dest: paths.templates + '_inlinejs'})
		))
		.pipe($.if(['*.js', '!*.min.js'],
			$.uglify({mangle: false})
		))
		.pipe($.if(['*.js', '!*.min.js'],
			$.rename({suffix: '.min'})
		))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(paths.templates + '_inlinejs'))
		.pipe($.filter('**/*.js'))
		.pipe($.livereload());
}

// js task - minimize any distribution Javascript into the public js folder, and add our banner to it
function buildJs() {
	$.fancyLog('-> Building js');
	return gulp.src(univ.distJs)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.if(['*.js', '!*.min.js'],
			$.newer({dest: paths.dist.js, ext: '.min.js'}),
			$.newer({dest: paths.dist.js})
		))
		.pipe($.if(['*.js', '!*.min.js'],
			$.uglify({mangle: false})
		))
		.pipe($.if(['*.js', '!*.min.js'],
			$.rename({suffix: '.min'})
		))
		.pipe($.header(banner, {pkg: pkg}))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(paths.dist.js))
		.pipe($.filter('**/*.js'))
    .pipe($.livereload());	
}

// process the criticalCSS async
function processCritCss(cb) {
	let criticalWidth = 1200;
	let criticalHeight = 800;

	return pkg.critical.forEach(function(obj){
		const criticalSrc = pkg.urls.critical + obj.url;
		const criticalDest = paths.templates + '/criticalCss/' + obj.template + '_critical.min.css';
		$.fancyLog('-> Generating critical CSS: ' + $.chalk.cyan(criticalSrc) + ' -> ' + $.chalk.magenta(criticalDest));
		$.critical.generate({
			src: criticalSrc,
			// dest: paths.templates + 'criticalcss' + element.template + '_critical.min.css',
			target: {
				css: criticalDest,
			},
			inline: false,
			ignore: [],
			css: [
				paths.dist.css + vars.siteCssName,
			],
			minify: true,
			width: criticalWidth,
			height: criticalHeight
		}, (err, output) => {
			if (err) {
				$.fancyLog($.chalk.magenta(err));
			}
			cb();
		});
	})	
}

function staticAssetsVer(alldone) {
	gulp.src(paths.configLoc + '/general.php')
		.pipe($.replace(/staticVersion' => '(\d+)',/g, function(match, p1, offset, string) {
					p1++;
					$.fancyLog("-> Changed staticAssetsVer to " + p1);
					stageStatVers = p1;
					return "staticVersion' => '" + p1 + "',";
		}))
		.pipe(gulp.dest(paths.configLoc));
		alldone();
}

function stageStaticAssetsVer(alldone) {
	gulp.src(paths.configLoc + '/general.php')
		.pipe($.replace(/stageStaticVersion' => 's(\d+)',/g, function(match, p1, offset, string) {
					p1++;
					$.fancyLog("-> Changed stageStaticAssetsVer to s" + p1);
					stageStatVers = "s" + p1;
					return "stageStaticVersion' => 's" + p1 + "',";
		}))
		.pipe(gulp.dest(paths.configLoc));
		alldone();
}

function prodStaticAssetsVer(alldone) {
	gulp.src(paths.configLoc + '/general.php')
		.pipe($.replace(/prodStaticVersion' => 'p(\d+)',/g, function(match, p1, offset, string) {
					p1++;
					$.fancyLog("-> Changed prodStaticAssetsVer to p" + p1);
					prodStatVers = "p" + p1;
					return "prodStaticVersion' => 'p" + p1 + "',";
		}))
		.pipe(gulp.dest(paths.configLoc));
		alldone();
}

function faviconGen() {
	$.fancyLog('-> Generating favicons');
	return gulp.src('favicon_src.png').pipe(favicons({
		appName: pkg.name,
		appDescription: pkg.description,
		developerName: pkg.author,
		developerURL: pkg.urls.live,
		background: '#FFFFFF',
		url: pkg.urls.live,
		display: 'standalone',
		orientation: 'portrait',
		version: pkg.version,
		logging: false,
		online: false,
		html: 'assets/favicons.html',
		replace: true,
		pipeHTML: true,
		icons: {
			android: false, // Create Android homescreen icon. `boolean`
			appleIcon: true, // Create Apple touch icons. `boolean`
			appleStartup: false, // Create Apple startup images. `boolean`
			coast: true, // Create Opera Coast icon. `boolean`
			favicons: true, // Create regular favicons. `boolean`
			firefox: true, // Create Firefox OS icons. `boolean`
			opengraph: false, // Create Facebook OpenGraph image. `boolean`
			twitter: false, // Create Twitter Summary Card image. `boolean`
			windows: true, // Create Windows 8 tile icons. `boolean`
			yandex: true // Create Yandex browser icon. `boolean`
		}
	}))
	.pipe(gulp.dest(paths.favicon.dest));
}

function faviconBuild() {
	$.fancyLog('-> Copying favicon.ico');
	return gulp.src(univ.siteIcon)
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(paths.dist.base));
}

function cdnUploadCss() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'css/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/css';
				path.basename += '.' + statVers;
			})
		)
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/css', [/^.*\.(p|s)\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function cdnUploadJs() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'js/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/js';
				path.basename += '.' + statVers;
			})
		)
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/js', [/^.*\.(p|s)\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function cdnStageUploadCss() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'css/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/css';
				path.basename += '.' + stageStatVers;
			})
		)
		.pipe($.awspublish.gzip())
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/css', [/^.*\.p\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function cdnStageUploadJs() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'js/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/js';
				path.basename += '.' + stageStatVers;
			})
		)
		.pipe($.awspublish.gzip())
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/js', [/^.*\.p\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function cdnProdUploadCss() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'css/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/css';
				path.basename += '.' + prodStatVers;
			})
		)
		.pipe($.awspublish.gzip())
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/css', [/^.*\.s\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function cdnProdUploadJs() {
	$.fancyLog('-> Uploading to CDN');
		return gulp.src(paths.src.cdn + 'js/**')
		.pipe(
			rename(function(path) {
				path.dirname = '/assets/js';
				path.basename += '.' + prodStatVers;
			})
		)
		.pipe($.awspublish.gzip())
		.pipe(publisherDev.publish())
		.pipe(publisherDev.sync('assets/js', [/^.*\.s\d+\.(css|map|js)/]))
		.pipe($.awspublish.reporter());
}

function templateDev() {
	return gulp
	.src(paths.markup.src)
	.pipe($.livereload());
}

// Watch task
function watch () {
	$.livereload.listen();
	gulp.watch(paths.src.scss, series(scss,css));
	gulp.watch(paths.src.js, series(jsInline, jsBabel, buildJs, jsCombine));
	gulp.watch(paths.markup.src, templateDev);
}

// Build task
function build(done) {
	gulp.series(staticAssetsVer, parallel(series(faviconGen, faviconBuild), series(jsInline, jsBabel, buildJs, jsCombine), series(scssBuild, cssBuild, processCritCss)), cdnUploadJs, cdnUploadCss)(done);
}

function stageBuild(done) {
	gulp.series(stageStaticAssetsVer, parallel(series(faviconGen, faviconBuild), series(jsInline, jsBabel, buildJs, jsCombine), series(scssBuild, cssBuild, processCritCss)), cdnStageUploadJs, cdnStageUploadCss)(done);
}

function prodBuild(done) {
	gulp.series(prodStaticAssetsVer, parallel(series(faviconGen, faviconBuild), series(jsInline, jsBabel, buildJs, jsCombine), series(scssBuild, cssBuild, processCritCss)), cdnProdUploadJs, cdnProdUploadCss)(done);
}
	
exports.default = watch;
exports.stageBuild = stageBuild;
exports.prodBuild = prodBuild;
exports.templateDev = templateDev;

exports.scss = scss;
exports.css = series(scss, css);
exports.criticalcss = series(scss, css, processCritCss);

exports.jsInline = jsInline;
exports.jsBabel = jsBabel;
exports.jsCombine = jsCombine;
exports.js = series(jsInline, jsBabel, buildJs);
exports.jsBuild = series(jsInline, jsBabel, buildJs, jsCombine);

exports.favis = series(faviconGen, faviconBuild);

exports.cdnUploadCss = cdnUploadCss;
exports.cdnUploadJs = cdnUploadJs;
exports.cdnStageUploadCss = cdnStageUploadCss;
exports.cdnStageUploadJs = cdnStageUploadJs;
exports.cdnProdUploadCss = cdnProdUploadCss;
exports.cdnProdUploadJs = cdnProdUploadJs;

exports.staticAssetsVer = staticAssetsVer;
exports.stageStaticAssetsVer = stageStaticAssetsVer;
exports.prodStaticAssetsVer = prodStaticAssetsVer;
