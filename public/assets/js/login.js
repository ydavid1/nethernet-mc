// remove default from the form #login
// document.querySelector('#login').addEventListener('submit', async function(event) {
//     event.preventDefault();
//     var form = this;
//     var formData = new FormData(form);
//     console.log(formData.get('email'));
    
//     await fetch('/api/login', {
//         method: 'POST',
//         body: formData
//     }).then(response => {
//         if (response.status == 200) {
//             window.location.href = '/panel';
//         } else {
//             console.log('Invalid login');
//         }
//     }).catch(err => {
//         console.log(err);
//     });

// });