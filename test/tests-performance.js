﻿///<reference path="run-unit-tests.html" />

(function () {
    
    module("performance", {
        setup: function () {
        },
        teardown: function () {
            stop(); Dexie.delete("PerformanceDB").onblocked(function() {
                //alert("Please close other browsers and tabs! Another browser or tab is blocking the database from being deleted. ");
            }).catch(function (e) {
                ok(false, e);
            }).finally(function () {
                start();
            });
        }
    });

    asyncTest("performance", function () {
        var db = new Dexie("PerformanceDB");
        db.version(1).stores({ emails: "++id,from,to,subject,message,shortStr" });
        db.on("blocked", function() {
            alert("Please close other browsers and tabs! Another browser or tab is blocking the database from being upgraded or deleted.");
        });

        var tick;
        db.delete().then(function () {

            function randomString(count) {
                return function () {
                    var ms = [];
                    for (var i = 0; i < count; ++i) {
                        ms.push(String.fromCharCode(32 + Math.floor(Math.random() * 96)));
                    }
                    return ms.join('');
                }
            }

            db.open();

            tick = Date.now();

            // Create 10,000 emails
            ok(true, "Creating 10,000 emails");
            return db.transaction("rw", db.emails, function () {
                for (var i = 1; i <= 10000; ++i) {
                    db.emails.add({
                        from: "from" + i + "@test.com",
                        to: "to" + i + "@test.com",
                        subject: "subject" + i,
                        message: "message" + i,
                        shortStr: randomString(2)()
                    });
                }
            })

        }).then(function () {
            ok(true, "Time taken: " + (Date.now() - tick));

            // Speed of equals()
            ok(true, "Speed of equals()");
            tick = Date.now();
            return db.emails.where("shortStr").equals("yk").toArray();

        }).then(function (a) {
            var tock = Date.now();
            ok(true, "Time taken: " + (tock - tick));
            ok(true, "Num emails found: " + a.length);
            ok(true, "Time taken per found item: " + (tock - tick) / a.length);

            // Speed of equalsIgnoreCase()
            ok(true, "Speed of equalsIgnoreCase()");
            tick = Date.now();
            return db.emails.where("shortStr").equalsIgnoreCase("yk").toArray();

        }).then (function (a) {
            var tock = Date.now();
            ok(true, "Time taken: " + (tock - tick));
            ok(true, "Num emails found: " + a.length);
            ok(true, "Time taken per found item: " + (tock - tick) / a.length);
                        

            // Speed of manual filter case insensitive search
            ok(true, "Speed of manual filter case insensitive search");
            tick = Date.now();
            var foundEmails = [];
            return db.emails.each(function (email) {
                if (email.shortStr.toLowerCase() === "yk")
                    foundEmails.push(email);
            }).then(function () { return foundEmails; });

        }).then (function (foundEmails) {
            var tock = Date.now();
            ok(true, "Time taken: " + (tock - tick));
            ok(true, "Num emails found: " + foundEmails.length);
            ok(true, "Time taken per found item: " + (tock - tick) / foundEmails.length);

        }).catch(Error, function (e) {
            ok(false, e.name + ":" + e.message + " " + e.stack);

        }).catch(function (e) {
            ok(false, e.toString());

        }).finally(function() {
            db.close();
            start();
        });
    });
})();
