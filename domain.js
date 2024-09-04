const cloudflare = require('cloudflare');

const cf = new cloudflare({
    apiEmail: "yehudahdavid@gmail.com",
    apiKey: "b8830e4fc829c73a6a3151e94c0cba320a373"
});

async function main() {
    let records = await cf.dns.records.list({
        zone_id: 'f553aa075dfd3dc89076cecd68592226'
    }).then((records) => {
        // console.log(records);
        // itereate though the records
        records.result.forEach((record) => {
            if (record.type == 'SRV') {
                if (record.name == '_minecraft._tcp.mc.nethernet.org') {
                    console.log('Found record');
                    // delete the record
                    console.log(record.id);
                    cf.dns.records.delete(record.id, {
                        zone_id: 'f553aa075dfd3dc89076cecd68592226'
                    }).then((response) => {
                        console.log(response);
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
        })
    });
}

main()
// cf.dns.records.create({
//     zone_id: 'f553aa075dfd3dc89076cecd68592226',
//     type: 'SRV',
//     name: '_minecraft._tcp.mc.nethernet.org',
//     data: {
//         priority: 0,
//         weight: 0,
//         port: 25565,
//         target: 'join.nethernet.org'
//     }
// });