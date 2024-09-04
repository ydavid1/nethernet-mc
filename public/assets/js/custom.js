$(function(){$(document).scroll(function(){var $nav=$(".fixed-top");$nav.toggleClass('scrolled',$(this).scrollTop()>$nav.height())})})
// detect when #scrollbtn.a.btn is clicked and then scroll to document.getElementById('minecraft')
$('#scrollbtn').click(function() {
        $.scrollTo('#feats', 200)
        console.log("clicked");
    }
);