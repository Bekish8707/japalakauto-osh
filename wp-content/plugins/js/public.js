jQuery(document).ready(function($) {
    var S2F_Count_Link = {
        element: $('.s2f-count-items-link'),
        update: function(data) {
            if (data['count-items'] === undefined) {
                return;
            }
            this.element.text(parseInt(data['count-items']));
        }
    };
    var S2F_Save_Buttons = {
        buttons: $('.s2f-result-item-save'),
        buttons_class: '.s2f-result-item-save',
        init: function() {
            this.addItem();
            this.deleteItem();
            this.deleteListItem();
        },
        addItem: function() {
            $('body').on('click', '.s2f-item-not-saved', function(e) {
                e.preventDefault();
                var button = $(this);
                var data = {
                    'action': 's2f_save_item',
                    'item_id': button.data('item-id')
                };
                button.addClass('s2f-loading');
                $.post(S2FData.ajaxUrl, data, function(response) {
                    if (!response.success) {
                        return
                    }
                    button.addClass('s2f-item-saved').removeClass('s2f-item-not-saved');
                    if (response.data) {
                        S2F_Count_Link.update(response.data);
                    }
                }).always(function() {
                    button.removeClass('s2f-loading');
                });
            });
        },
        deleteItem: function() {
            $('body').on('click', '.s2f-item-saved', function(e) {
                e.preventDefault();
                var button = $(this);
                var data = {
                    'action': 's2f_delete_item',
                    'item_id': button.data('item-id')
                };
                button.addClass('s2f-loading');
                $.post(S2FData.ajaxUrl, data, function(response) {
                    if (!response.success) {
                        return
                    }
                    button.addClass('s2f-item-not-saved').removeClass('s2f-item-saved');
                    if (response.data) {
                        S2F_Count_Link.update(response.data);
                    }
                }).always(function() {
                    button.removeClass('s2f-loading');
                });
            });
        },
        deleteListItem: function() {
            $('body').on('click', '.delete-saved-item', function(e) {
                e.preventDefault();
                var button = $(this);
                var data = {
                    'action': 's2f_delete_item',
                    'item_id': button.data('item-id')
                };
                button.addClass('s2f-loading');
                $.post(S2FData.ajaxUrl, data, function(response) {
                    if (!response.success) {
                        return
                    }
                    button.closest('.s2f-saved-item').remove();
                    if (response.data) {
                        S2F_Count_Link.update(response.data);
                    }
                });
            });
        }
    };
    S2F_Save_Buttons.init();
    var S2F_Comparing = {
        buttons: $('.s2f-result-compare'),
        buttonsClass: 's2f-result-compare',
        link: $('.s2f-comparing-link'),
        container: null,
        maxCarsNumber: 3,
        init: function() {
            this.setContainer();
            this.addItem();
            this.deleteItem();
        },
        addItem: function() {
            var self = this;
            $('body').on('click', '.' + this.buttonsClass + ':not(.compare-added, .compare-pause)', function(e) {
                e.preventDefault();
                var button = $(this);
                if (self.getItemsCount() >= self.maxCarsNumber) {
                    alert('You may compare up to ' + self.maxCarsNumber + ' vehicles at a time.\n');
                    return;
                }
                var itemId = button.data('item-id');
                if (!self.addItemToCookies(itemId)) {
                    return;
                }
                button.addClass('compare-added');
                self.addItemToContainer(itemId, button);
                self.createLink();
            });
        },
        deleteItem: function() {
            var self = this;
            $('body').on('click', '.s2f-container--compare-item__delete', function(e) {
                e.preventDefault();
                var button = $(this);
                var itemId = button.data('item-id');
                $('#s2fc-' + itemId).remove();
                $('#s2fc-button-' + itemId).removeClass('compare-added');
                var compareItems = self.deleteItemFromCookies(itemId);
                self.createLink();
                if (compareItems.length === 0) {
                    self.container.hide();
                }
            });
            $('body').on('click', '.s2f-result-compare.compare-added', function(e) {
                e.preventDefault();
                var button = $(this);
                var itemId = button.data('item-id');
                $('#s2fc-' + itemId).remove();
                button.removeClass('compare-added');
                var compareItems = self.deleteItemFromCookies(itemId);
                self.createLink();
                if (compareItems.length === 0) {
                    self.container.hide();
                }
            });
            $('body').on('click', '.delete-compare-item', function(e) {
                e.preventDefault();
                var button = $(this);
                var itemId = button.data('item-id');
                button.closest('.s2f-compare-item').remove();
                self.deleteItemFromCookies(itemId);
            });
        },
        addItemToCookies: function(itemId) {
            var s2fComparing = Cookies.getJSON('s2fComparing');
            if (s2fComparing === undefined) {
                s2fComparing = [];
            }
            if (s2fComparing.indexOf(itemId) !== -1) {
                return false;
            }
            s2fComparing.push(itemId);
            Cookies.set('s2fComparing', s2fComparing);
            return true;
        },
        deleteItemFromCookies: function(itemId) {
            var s2fComparing = Cookies.getJSON('s2fComparing');
            if (s2fComparing === undefined) {
                return;
            }
            var itemIndex = s2fComparing.indexOf(itemId);
            if (itemIndex === -1) {
                return
            }
            s2fComparing.splice(itemIndex, 1);
            Cookies.set('s2fComparing', s2fComparing);
            return s2fComparing;
        },
        createLink: function() {
            var s2fComparing = Cookies.getJSON('s2fComparing');
            if (s2fComparing === undefined) {
                this.container.hide();
                return;
            }
            var params = $.param({
                compare: s2fComparing
            });
            $('.s2f-comparing-link').attr('href', '/demo/automotive/compare?' + params);
        },
        addItemToContainer: function(itemId, button) {
            if (!this.container.is(":visible")) {
                this.container.show();
            }
            var self = this;
            var data = {
                'action': 'comp_get_item_img',
                'item_id': itemId
            };
            button.addClass('s2f-loading');
            $.post(S2FData.ajaxUrl, data, function(response) {
                console.log(response);
                if (!response.success) {
                    return '';
                }
                var block = '' + '<div id="s2fc-' + itemId + '" class="s2f-container-compare-item col-sm-4">' + '<img src="' + response.data.imgSRC + '"><span class="s2f-container--compare-item__delete" data-item-id="' + itemId + '"><i class="fa fa-times"></i></span><div class="compare-meta">' + response.data.year + ' ' + response.data.make + ' ' + '' + ' ' + response.data.model + '</div></div>' + '';
                self.container.find('.s2f-comparing-items').append(block);
            }).always(function() {
                button.removeClass('s2f-loading');
            });
        },
        setContainer: function() {
            var self = this;
            self.container = $('#s2f-comparing-container');
            $(document).on('s2f-after-ajax-search', function() {
                self.container = $('#s2f-comparing-container');
            });
        },
        getItemsCount: function() {
            return this.container.find('.s2f-container-compare-item').length;
        }
    };
    S2F_Comparing.init();
});
