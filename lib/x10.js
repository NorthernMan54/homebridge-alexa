exports.readX10config = function(x10conf) {
    var fs = require('fs');
    var x10confObject = {};

    var x10confData = fs.readFileSync(x10conf);
    var pattern = new RegExp('\nalias.*', 'ig');

    // ALIAS Front_Porch A1 StdLM

    var match = [];
    while ((match = pattern.exec(x10confData)) != null) {
        var line = match[0].split(/[ \t]+/);
        x10confObject[line[1]] = {
            'name': line[1].replace(/_/g, ' '),
            'lname': line[1],
            'housecode': line[2],
            'module': line[3]
        };
    }
    return x10confObject;
}
