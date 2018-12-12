
function openForm(ltype,lbalance){
      $('#applicationform').attr("style","display:block");
      var replaceText = "<span>Applying for "+ltype+"</span>";
      $('#ltypename').empty();$('#reason').val("---");$('#noofdays').val(1);
      $('#ltypename').append(replaceText);
      $('#ltypeval').val(ltype);
      $('#lbalanceval').val(lbalance);
      return true;
   }
$(document).ready(function(){
  $('form[id="appformid"]').validate({
   rules: {
        reason: {required:true},
        fromdate: {
          required: true,
          min: new Date()
        },
        todate: {
          required: true,
          min: new Date()
        }
      },
     messages: {
        reason: 'This field is required',
        fromdate: {
          min: 'Backdated leave cannot be applied',
          required:'This field is mandatory'
        },
        todate: {
          min: 'Backdated leave cannot be applied',
          required:'This field is mandatory'
        }
      },
      submitHandler: function(form) {
        $('#noofdays-error').remove();
        alert($('#lbalanceval').val()); alert($('#noofdays').val());
        if( parseInt($('#noofdays').val()) > parseInt($('#lbalanceval').val())){
          var replaceText = '<label id="noofdays-error" class="error" for="noofdays" style="display:inline-block">You are exceeding the Max leaves in the category</label>';
          $('#noofdays').after(replaceText);
          return false;
       }
      }
  });


});
