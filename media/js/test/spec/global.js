/* Base JS unit test spec for bedrock global.js
 * For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

describe("global.js", function() {

    describe("trigger_ie_download", function () {

        it("should open a popup for IE < 11", function () {
            // Let's pretend to be IE version 9 just for this individual test
            var appVersion = '5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)';

            /* Wrap window.open with a stub function, since all we need
             * to know is that window.open gets called. We do not need
             * window.open to execute to satisfy the test. We can also
             * spy on this stub to see if it gets called successfully. */
            window.open = sinon.stub();
            trigger_ie_download('foo', appVersion);
            expect(window.open.called).toBeTruthy();
        });

        it("should not open a popup for IE 11", function () {
            // Let's pretend to be IE version 11
            var appVersion = '5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; rv:11.0) like Gecko';

            window.open = sinon.stub();
            trigger_ie_download('foo', appVersion);
            expect(window.open.called).not.toBeTruthy();
        });

        it("should not open a popup for other browsers", function () {
            // Let's pretend to be a non IE browser
            var appVersion = '5.0 (Macintosh)';

            window.open = sinon.stub();
            trigger_ie_download('foo', appVersion);
            expect(window.open.called).not.toBeTruthy();
        });

    });

    describe("init_download_links", function () {

        /* Append an HTML fixture to the document body
         * for each test in the scope of this suite */
        beforeEach(function () {
            $('<a class="download-link" data-direct-link="bar">foo</a>').appendTo('body');
        });

        /* Then after each test remove the fixture */
        afterEach(function() {
            $('.download-link').remove();
        });

        it("should call trigger_ie_download when clicked", function () {
            trigger_ie_download = sinon.stub();
            init_download_links();
            $('.download-link').trigger('click');
            expect(trigger_ie_download.called).toBeTruthy();
        });

    });

    describe("init_android_download_links", function () {

        beforeEach(function () {
            // Pretend we're on Android
            window.site = {
                platform: 'android'
            };
            //create an HTML fixture to test against
            $('<a class="download-link" href="https://play.google.com/store/apps/details?id=org.mozilla.firefox">foo</a>').appendTo('body');
        });

        afterEach(function(){
            // Tidy up after each test
            window.site = null;
            $('.download-link').remove();
        });

        it("should set a URL with the market scheme", function () {
            init_android_download_links();
            expect($('.download-link').attr('href')).toEqual('market://details?id=org.mozilla.firefox');
        });

    });

    describe("getFirefoxMasterVersion", function () {

        it("should return the firefox master version number", function () {
            var result;
            // Pretend to be Firefox 23
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
            result = getFirefoxMasterVersion(ua);
            expect(result).toEqual(23);
        });

        it("should return 0 for non Firefox browsers", function () {
            var result;
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
            result = getFirefoxMasterVersion(ua);
            expect(result).toEqual(0);
        });
    });

    describe("isFirefox", function() {
        it("should consider Firefox to be Firefox", function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
            var result = isFirefox(ua);
            expect(result).toBeTruthy();
        });

        it("should not consider Camino to be Firefox", function() {
            var ua = 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.4; en; rv:1.9.2.24) Gecko/20111114 Camino/2.1 (like Firefox/3.6.24)';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it("should not consider Chrome to be Firefox", function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it("should not consider Safari to be Firefox", function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it("should not consider IE to be Firefox", function() {
            var ua = 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it("should not consider SeaMonkey to be Firefox", function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:25.0) Gecko/20100101 Firefox/25.0 SeaMonkey/2.22.1';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it("should not consider Iceweasel to be Firefox", function() {
            var ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1';
            var result = isFirefox(ua);
            expect(result).not.toBeTruthy();
        });
    });

    describe("isFirefoxMobile", function () {

        it("should return false for Firefox on Desktop", function() {
            expect(isFirefoxMobile('Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0')).not.toBeTruthy();
            expect(isFirefoxMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:10.0) Gecko/20100101 Firefox/10.0')).not.toBeTruthy();
            expect(isFirefoxMobile('Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0')).not.toBeTruthy();
        });

        it("should return true for Firefox Android on Phone", function() {
            var ua = 'Mozilla/5.0 (Android; Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it("should return true for Firefox Android on Tablet", function() {
            var ua = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it("should return true for Firefox OS on Phone", function() {
            var ua = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it("should return true for Firefox OS on Tablet", function() {
            var ua = 'Mozilla/5.0 (Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it("should return true for Firefox for Maemo (Nokia N900)", function() {
            var ua = 'Mozilla/5.0 (Maemo; Linux armv7l; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 Fennec/10.0.1';
            var result = isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

    });

    describe("isFirefoxUpToDate", function () {

        it("should consider up to date if latest is equal to firefox version", function() {
            var result;
            /* Use a stub to return a pre-programmed value
             * from getFirefoxMasterVersion */
            getFirefoxMasterVersion = sinon.stub().returns(21);
            result = isFirefoxUpToDate("21.0", [10, 17]);
            expect(getFirefoxMasterVersion.called).toBeTruthy();
            expect(result).toBeTruthy();
        });

        it("should consider up to date if latest is less than firefox version", function() {
            var result;
            getFirefoxMasterVersion = sinon.stub().returns(22);
            result = isFirefoxUpToDate("21.0", [10, 17]);
            expect(getFirefoxMasterVersion.called).toBeTruthy();
            expect(result).toBeTruthy();
        });

        it("should not consider up to date if latest greater than firefox version", function() {
            var result;
            getFirefoxMasterVersion = sinon.stub().returns(20);
            result = isFirefoxUpToDate("21.0", [10, 17]);
            expect(getFirefoxMasterVersion.called).toBeTruthy();
            expect(result).not.toBeTruthy();
        });

        it("should consider esr builds up to date", function() {
            var result;
            getFirefoxMasterVersion = sinon.stub().returns(10);
            result = isFirefoxUpToDate("21.0", [10, 17]);
            expect(getFirefoxMasterVersion.called).toBeTruthy();
            expect(result).toBeTruthy();
        });
    });

    describe("gaTrack", function () {

        var clock;

        /* Google Analytics is not loaded for these tests, so we'll
         * use an array and test the objects that get pushed to it */
        window._gaq = [];

        /* For this test suite we use fake timers, which provides
         * synchronous implementation of setTimeout. Seems a little
         * waiting is needed when testing a push to window._gaq */
        beforeEach(function () {
            clock = sinon.useFakeTimers();
        });

        afterEach(function () {
            clock.restore();
            window._gaq = [];
        });

        it("should track a single GA event", function () {
            var evt = ['_trackEvent', 'GA event test', 'test', 'test'];
            gaTrack(evt);
            clock.tick(10);
            expect(window._gaq[0]).toEqual(evt);
        });

        it("should fire a callback if needed", function () {
            /* For our callback use a jasmine spy, then we can easily test
             * to make sure it gets called once gaTrack has finished executing */
            var callback = jasmine.createSpy();
            gaTrack(['_trackEvent', 'GA event test', 'test', 'test'], callback);
            clock.tick(700); // must be longer than callback timeout (600ms) in gaTrack
            expect(callback).toHaveBeenCalled();
        });

        it("should not fire a callback twice", function () {
            var callback = jasmine.createSpy();
            gaTrack(['_trackEvent', 'GA event test', 'test', 'test'], callback);
            clock.tick(700);
            expect(callback.callCount).toEqual(1);
            // The callback should not be executed by subsequent GA events
            gaTrack(['_trackEvent', 'GA event test', 'test', 'test']);
            clock.tick(700);
            expect(callback.callCount).toEqual(1);
        });

        it("should still fire a callback if window._gaq is undefined", function () {
            var callback = jasmine.createSpy();
            window._gaq = undefined;
            gaTrack(['_trackEvent', 'GA event test', 'test', 'test'], callback);
            clock.tick(10);
            expect(callback).toHaveBeenCalled();
        });

    });

});
