(function($) {
    "use strict";
    window.GorillaThemes = window.GorillaThemes || {};
    window.GorillaThemes.validator = null;
    $(document).ready(function() {
        var $form = $('#sell-your-car');
        if ($form.length) {
            if (window.GorillaThemes.hasOwnProperty('ajaxUrl')) {
                window.GorillaThemes.makeModelAjax();
                window.GorillaThemes.locationAjax();
                window.GorillaThemes.fileUploadAjax();
                window.GorillaThemes.fileRemoveAjax();
                window.GorillaThemes.clearAjax();
                window.GorillaThemes.initForm($form);
            }
        }
    });
    window.GorillaThemes.makeModelAjax = function() {
        var $make = $('#gt-make')
          , $model = $('#gt-model')
          , $model_value = $model.attr('data-value');
        if ($make.length && $model.length) {
            $make.on('change', function(e) {
                var mainCat = $make.val()
                  , data = {
                    action: 'gt_ajax_makemodel',
                    cat: mainCat,
                    nonce: window.GorillaThemes.nonce
                };
                $model.prev('.gt-loading').show();
                $.post(window.GorillaThemes.ajaxUrl, data, function(response) {
                    response = window.GorillaThemes.sanitizeAJAX(response);
                    if (response.success === true) {
                        if (response.data.options && response.data.options.length) {
                            $model.prop('disabled', false);
                            $model.html(response.data.options)
                            if ($model_value) {
                                $model.val($model_value).trigger('change', true);
                            }
                        } else {
                            $model.html('').prop('disabled', true);
                        }
                    } else {
                        $model.html('').prop('disabled', true);
                    }
                    $model.prev('.gt-loading').hide();
                }, 'text');
            });
            if ($make.val() && $model_value) {
                $make.trigger('change', true);
            }
        }
    }
    ;
    window.GorillaThemes.locationAjax = function() {
        var $state = $('#gt-state')
          , $city = $('#gt-city')
          , $city_value = $city.attr('data-value');
        if ($state.length && $city.length) {
            $state.on('change', function(e) {
                var mainCat = $state.val()
                  , data = {
                    action: 'gt_ajax_location',
                    cat: mainCat,
                    nonce: window.GorillaThemes.nonce
                };
                $city.prev('.gt-loading').show();
                $.post(window.GorillaThemes.ajaxUrl, data, function(response) {
                    response = window.GorillaThemes.sanitizeAJAX(response);
                    if (response.success === true) {
                        if (response.data.options && response.data.options.length) {
                            $city.prop('disabled', false);
                            $city.html(response.data.options)
                            if ($city_value) {
                                $city.val($city_value).trigger('change', true);
                            }
                        } else {
                            $city.html('').prop('disabled', true);
                        }
                    } else {
                        $city.html('').prop('disabled', true);
                    }
                    $city.prev('.gt-loading').hide();
                }, 'text');
            });
            if ($state.val() && $city_value) {
                $state.trigger('change', true);
            }
        }
    }
    ;
    window.GorillaThemes.fileRemoveAjax = function() {
        var $container = $('#upload-result');
        $container.on('click', 'a.gt-remove', function(e) {
            var $t = $(this)
              , $row = $t.closest('tr')
              , name = $row.find('td.name').text()
              , data = {
                action: 'gt_ajax_filedelete',
                nonce: window.GorillaThemes.nonce,
                name: name
            };
            if ($t.hasClass('cleanup')) {
                $row.fadeOut(function() {
                    $(this).remove();
                });
            } else {
                $.post(window.GorillaThemes.ajaxUrl, data, function(response) {
                    response = window.GorillaThemes.sanitizeAJAX(response);
                    if (response.success && response.success === true) {
                        $('#fileupload').prop('disabled', false);
                        $row.fadeOut(function() {
                            $(this).remove();
                        });
                    }
                }, 'text');
            }
            e.preventDefault();
            e.stopPropagation();
        });
    }
    ;
    window.GorillaThemes.fileUploadAjax = function() {
        var $upload = $('#fileupload')
          , $result = $('#upload-result')
          , $tbody = $result.find('table').find('tbody');
        var uploadMaxSize = 1048576 * 5;
        $upload.fileupload({
            dropZone: null,
            url: window.GorillaThemes.ajaxUrl,
            dataType: 'json',
            singleFileUploads: true,
            maxFileSize: uploadMaxSize,
            limitMultiFileUploadSize: uploadMaxSize,
            maxNumberOfFiles: 12,
            minFileSize: undefined,
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
            formData: {
                action: 'gt_ajax_fileupload',
                nonce: window.GorillaThemes.nonce
            }
        }).on('fileuploadstart', function() {
            $('#uploaded-files').show();
        }).on('fileuploadadd', function(e, data) {
            var name = data.files[0].name
              , size = window.GorillaThemes.formatFileSize(data.files[0].size)
              , $row = $('<tr><td class="thumb"></td><td class="name">' + name + '</td><td class="size">' + size + '</td><td class="status"><span class="gt-loading">Uploading...</span></td><td class="operations"></td></tr>');
            data.context = $row.appendTo($tbody);
            data.submit();
        }).on('fileuploaddone', function(e, data) {
            if (data.result.success) {
                var file = data.result.data.file;
                data.context.find('td.thumb').html('<img class="gt-thumb" src="' + file.url + '" />');
                data.context.find('td.status').html('<span class="gt-success">Complete</span>');
                data.context.find('td.operations').html('<a class="gt-remove btn-default button tiny round alert" href="javascript:;">Remove</a>');
                if (data.result.data.disable == true) {
                    $('#fileupload').prop('disabled', true);
                }
            } else {
                data.context.find('td.status').html('<span class="gt-error">' + data.result.data.msg + '</span>');
                data.context.find('td.operations').html('<a class="gt-remove btn-default button tiny round alert cleanup" href="javascript:;">Remove</a>');
                if (data.result.data.code == 99) {
                    $('#fileupload').prop('disabled', true);
                }
            }
        });
    }
    ;
    window.GorillaThemes.clearAjax = function() {
        $('#gt-clear').on('click', function(e) {
            var data = {
                action: 'gt_ajax_clear',
                nonce: window.GorillaThemes.nonce
            };
            $.post(window.GorillaThemes.ajaxUrl, data, function(response) {
                response = window.GorillaThemes.sanitizeAJAX(response);
                if (response.success && response.success === true) {
                    window.state.reload();
                }
            }, 'text');
            e.preventDefault();
            e.stopPropagation();
        });
    }
    ;
    window.GorillaThemes.initForm = function($form) {
        jQuery.validator.addMethod('selectcheck', function(value) {
            return (value != -1);
        }, 'This field is required.');
        window.GorillaThemes.validator = $form.on('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }).validate({
            rules: {
                model: {
                    selectcheck: true
                },
                make: {
                    selectcheck: true
                },
                type: {
                    selectcheck: true
                },
                fileupload: {
                    accept: "image/*"
                }
            },
            submitHandler: function(form) {
                var $form = $(form)
                  , data = $form.serialize()
                  , $submit = $('#gt-submit', $form)
                  , $clear = $('#gt-clear', $form);
                $clear.prop('disabled', true);
                $submit.prop('disabled', true).next('.gt-loading').show();
                data += '&action=gt_ajax_submit';
                $.post(window.GorillaThemes.ajaxUrl, data, function(response) {
                    response = window.GorillaThemes.sanitizeAJAX(response);
                    if (response.success === true) {
                        $form.fadeOut(function() {
                            $("html, body").animate({
                                scrollTop: 0
                            }, "slow");
                            $('.gt-paypal').slideDown();
                        });
                    } else if (response.data) {
                        window.GorillaThemes.displayFormErrors(response.data);
                    } else {
                        window.GorillaThemes.displayFormErrors({
                            security_code3: 'An unknown error ocurred please contact technical support'
                        });
                    }
                    $clear.prop('disabled', false);
                    $submit.prop('disabled', false).next('.gt-loading').hide();
                }, 'text');
            }
        });
    }
    ;
    window.GorillaThemes.displayFormErrors = function(errors) {
        var validator_messages = {};
        for (var i in errors) {
            validator_messages[i] = errors[i];
        }
        window.GorillaThemes.validator.showErrors(validator_messages);
    }
    ;
    window.GorillaThemes.formatFileSize = function(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }
        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }
        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }
        return (bytes / 1000).toFixed(2) + ' KB';
    }
    ;
    window.GorillaThemes.sanitizeAJAX = function(response) {
        var pos = response.indexOf('{');
        if (pos !== 0) {
            response = response.substr(pos);
        }
        pos = response.lastIndexOf('}');
        if (pos !== response.length) {
            response = response.substr(0, pos + 1);
        }
        return jQuery.parseJSON(response);
    }
    ;
}
)(jQuery);
