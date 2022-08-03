// NO JQUERY TODAY HOHOHO
var tbody;
var generated;
var last_url = location.href; 

var observer = new MutationObserver(mutation_callback);

function mutation_callback(mutations) {
    const url = location.href;
    if (url !== last_url) {
        if (tbody) {
            tbody.remove();
            tbody = null;
        }
        if (generated) {
            generated.remove();
            generated = null;
        }
        return
    }


    if (generated) return;

    let list = document.getElementsByTagName('tbody');
    for (let i = 0; i < list.length; i++) {
        if (list[i].hasAttribute('data-v-ea7b074c')) {
            tbody = list[i];
            transform();
            break;
        }
    }
}

observer.observe(document, {
    subtree: true,
    attributes: true
});

function str2int(s) {
    var array = s.split(":");
    return [parseInt(array[0], 10), parseInt(array[1], 10)];
}

function resolve_credit(raw) {
    let a = /(\d)\((\d)-(\d)-(\d)\)/.exec(raw);
    a.shift();

    return a;
}

function resolve_section(raw) {
    return raw.split(/\s/).filter(n => n);
}

function resolve_start(raw) {
    const a = raw.split(/\s/);
    a[2] = str2int(a[2]);
    a[4] = str2int(a[4]);
    return a;
}

function transform() {
    // !!! tbody != null !!!

    var rows = tbody.getElementsByTagName('tr');

    if (rows.length == 0) {
        // table still empty, go bacc
        return;
    }


    const items = [];

    for (let i = 0; i < rows.length; i++) {
        const tds = rows[i].getElementsByTagName('td');

        const codeC = tds[0].getElementsByTagName('span');
        const nameC = tds[1].getElementsByTagName('span');

        let time;

        if (codeC.length > 0) {
            item = {
                code : codeC[0].innerHTML,
                name : nameC[0].innerHTML,
                credit : resolve_credit(tds[2].getElementsByTagName('span')[0]
                    .getElementsByTagName('span')[0]
                        .innerHTML),
                section : [],
                times : []
            }
        } else {
            item = items[items.length - 1];
        }
        
        item.section.push(resolve_section(tds[3].textContent));

        // TEACHSTART

        const teachbox = tds[4].getElementsByTagName('div')[0];
        const teachboxdivs = teachbox.getElementsByTagName('div');
        for (let j = 0; j < teachboxdivs.length; j++) {
            var that = teachboxdivs[j]
                .getElementsByTagName('span')[0];

            if (that === undefined) continue;

            if (that.className === "") {
                // CLOCCS
                const content = that.textContent;
                item.times.push(resolve_start(content));
            } else {
                // colorboxes
                if (that.getElementsByTagName("span"[0]).innerHTML == "Midterm") {
                    // mid
                } else {
                    // fi

                }

            }
        }
        console.log(item);

        items.push(item);
    }

    // GENEARTE TABLE

    const table_root = document.getElementsByClassName('ma-4')[0];

    const WDDICT = {
        จันทร์ : 0,
        อังคาร : 1,
        พุธ : 2,
        พฤหัสบดี : 3,
        ศุกร์ : 4,
        เสาร์ : 5,
        อาทิตย์ : 6
    }

    const WEEKDAY = function(s) {
        

        return `
        <div id='s-weekday-row-` + WDDICT[s].toString() +`'class='s-week-day s-cell'>
            <div class='s-day'>` + s + `</div>
        </div>
        `;
    }

    const HOURCELL = function(n, h) {
        return `
        <div class='s-head-hour'>
            <div class='s-number'>` + n.toString() + `</div>
            <div class='s-hourly-interval'>`
            + h.toString() + '.00 - ' + (h + 1).toString() + '.00' +
            `</div>
        </div>
        `;
    }

    const EMPCELL = function(c) {
        return "<div class='s-act-row'>" + c + "</div>"
    }

    const GATHER = function(c) {
        var concat = '';
        for (let j = 0; j < 7; j++) {
            concat += EMPCELL(separated[j])
        }
        return concat;
    }

    const ADDSEP = function() {
        return (`
        <div class='s-row s-hour-row'>
            ` + `<div class='s-hour-wrapper s-cell'>
                <div class='s-half-hour'></div>
                <div class='s-half-hour'></div>
            </div>`.repeat(7) + `
        </div>`).repeat(12);
    }

    const separated = {
        0 : "",
        1 : "",
        2 : "",
        3 : "",
        4 : "",
        5 : "",
        6 : ""
    };

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        var content = "";

        for (let j = 0; j < item.times.length; j++) {
            const weekday_id = WDDICT[item.times[j][1]];

            const hour = item.times[j][4][0] - item.times[j][2][0];
            const minute = Math.abs(item.times[j][4][1] - item.times[j][2][1]) / 30;
            const sizex = (hour * 100 + minute * 50).toString();
            
            const css = "\
            transform : translateX(" + ((item.times[j][2][0] - 8) * 100).toString() + "px);\
            min-width : " + sizex + "px;\
            max-width : " + sizex + "px;";
            content = "<div class='s-act-tab block' style='" + css + "'>\
            <div class='s-act-name'>"+ item.name + "</div>\
            <div class='s-wrapper'>"+
            "<div class='s-act-group'>"+ item.section + "</div>\
            </div>\
            </div>";
            separated[weekday_id] += content;
        }
    }

    generated = document.createElement('div');
    generated.id = "t-table";
    generated.innerHTML = `
    <div id='schedule'>
        <div class='s-legend'>
            <div class='s-cell s-head-info'>
                <div class='s-name'>ตาราง</div>
            </div>`
        + WEEKDAY("จันทร์")
        + WEEKDAY("อังคาร")
        + WEEKDAY("พุธ")
        + WEEKDAY("พฤหัสบดี")
        + WEEKDAY("ศุกร์")
        + WEEKDAY("เสาร์")
        + WEEKDAY("อาทิตย์")
        + `
        </div>
        <div class='s-container s-block'>
            <div class='s-head-info'>` + 
                HOURCELL(1, 8) +
                HOURCELL(2, 9) +
                HOURCELL(3, 10) +
                HOURCELL(4, 11) +
                HOURCELL(5, 12) +
                HOURCELL(6, 13) +
                HOURCELL(7, 14) +
                HOURCELL(8, 15) +
                HOURCELL(9, 16) +
                HOURCELL(10, 17) +
                HOURCELL(11, 18) +
                HOURCELL(12, 19) +
                `
            </div>
            <div class='s-rows-container'>
                <div class='s-activities'>` + GATHER() +
                `</div>` + ADDSEP() + `
            </div>
        </div>
    </div>
    `;
   
    table_root.insertBefore(generated, table_root.firstChild);
}