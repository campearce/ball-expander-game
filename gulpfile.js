var gulp = require('gulp'),
	eslint = require('gulp-eslint'),
	st = require('st'),
	http = require('http'),
	serverPort = 2000;

gulp.task('default', function() {
});

gulp.task('js.lint', function() {
	return gulp.src(['js/**/*.js'])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
});

gulp.task('watch', ['server'], function() {
	gulp.watch(['js/**/*.js'], ['js.lint']);
});

gulp.task('server', function(done) {
	http.createServer(
		st({ path: __dirname, index: 'index.html', cache: false })
	).listen(serverPort, done);
});
