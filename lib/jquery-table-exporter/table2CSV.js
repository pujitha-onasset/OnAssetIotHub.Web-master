jQuery.fn.table2CSV = function(options) {
    var options = jQuery.extend({
        separator: ',',
        exclude: ".noExl",
        header: [],
        headerSelector: 'th',
        columnSelector: 'td',
        delivery: 'download', // popup, value, download
        filename: 'file', // filename to download
        transform_gt_lt: true // make &gt; and &lt; to > and <
    },
    options);

    var csvData = [];
    var headerArr = [];
    var el = this;

    //header
    var numCols = options.header.length;
    var tmpRow = []; // construct header avalible array

    if (numCols > 0) {
        for (var i = 0; i < numCols; i++) {
            tmpRow[tmpRow.length] = formatData(options.header[i]);
        }
    } else {
        $(el).filter(':visible').find(options.headerSelector).not(options.exclude).each(function() {
            if ($(this).css('display') != 'none') tmpRow[tmpRow.length] = formatData($(this).html());
        });
    }

    row2CSV(tmpRow);

    // actual data
    $(el).find('tr').not(options.exclude).each(function() {
        var tmpRow = [];
        $(this).filter(':visible').find(options.columnSelector).not(options.exclude).each(function() {
            if ($(this).css('display') != 'none') tmpRow[tmpRow.length] = formatData($(this).html());
        });
        row2CSV(tmpRow);
    });
    if (options.delivery == 'popup') {
        var mydata = csvData.join('\n');
        if(options.transform_gt_lt){
            mydata=sinri_recover_gt_and_lt(mydata);
        }
        return popup(mydata);
    }
    else if(options.delivery == 'download') {
        var mydata = csvData.join('\n');
        if(options.transform_gt_lt){
            mydata=sinri_recover_gt_and_lt(mydata);
        }
        console.log("download csv");
        /*var url='data:text/csv;charset=utf8,' + encodeURIComponent(mydata);
        window.open(url);*/
        var isIE = /*@cc_on!@*/false || !!document.documentMode; // this works with IE10 and IE11 both :)
            //if (typeof msie !== "undefined" && msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // this works ONLY with IE 11!!!
            if (isIE) {
                console.log("is IE");
                if (typeof Blob !== "undefined") {
                    //use blobs if we can
                    fullTemplate = [mydata];
                    //convert to array
                    var blob1 = new Blob(fullTemplate, { type: "text/html" });
                    window.navigator.msSaveBlob(blob1, getFileName(options) );
                } else {
                    //otherwise use the iframe and save
                    //requires a blank iframe on page called txtArea1
                    txtArea1.document.open("text/html", "replace");
                    txtArea1.document.write(fullTemplate);
                    txtArea1.document.close();
                    txtArea1.focus();
                    sa = txtArea1.document.execCommand("SaveAs", true, getFileName(options) );
                }

            } else {
                console.log("isNot IE");
                var blob = new Blob([mydata], {type: "application/vnd.ms-excel"});
                window.URL = window.URL || window.webkitURL;
                link = window.URL.createObjectURL(blob);
                a = document.createElement("a");
                a.download = getFileName(options);
                a.href = link;

                document.body.appendChild(a);

                a.click();

                document.body.removeChild(a);
            }

        return true;
    } 
    else {
        var mydata = csvData.join('\n');
        if(options.transform_gt_lt){
            mydata=sinri_recover_gt_and_lt(mydata);
        }
        return mydata;
    }

    function sinri_recover_gt_and_lt(input){
        var regexp=new RegExp(/&gt;/g);
        var input=input.replace(regexp,'>');
        var regexp=new RegExp(/&lt;/g);
        var input=input.replace(regexp,'<');
        return input;
    }

    function row2CSV(tmpRow) {
        var tmp = tmpRow.join('') // to remove any blank rows
        // alert(tmp);
        if (tmpRow.length > 0 && tmp != '') {
            var mystr = tmpRow.join(options.separator);
            csvData[csvData.length] = mystr;
        }
    }
    function getFileName(options) {
        return ( options.filename ? options.filename + '.csv' : "file.csv" );
    }
    function formatData(input) {
        // replace " with “
        var regexp = new RegExp(/["]/g);
        var output = input.replace(regexp, "“");
        //HTML
        var regexp = new RegExp(/\<[^\<]+\>/g);
        var output = output.replace(regexp, "");
        output = output.replace(/&nbsp;/gi,' '); //replace &nbsp;
        if (output == "") return '';
        return '"' + output.trim() + '"';
    }
    function popup(data) {
        var generator = window.open('', 'csv', 'height=400,width=600');
        generator.document.write('<html><head><title>CSV</title>');
        generator.document.write('</head><body >');
        generator.document.write('<textArea cols=70 rows=15 wrap="off" >');
        generator.document.write(data);
        generator.document.write('</textArea>');
        generator.document.write('</body></html>');
        generator.document.close();
        return true;
    }
};
