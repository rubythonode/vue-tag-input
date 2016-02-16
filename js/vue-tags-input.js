var TagsInput = Vue.extend({
	template: '#tags-input-template',

	props: {
		tagsArray: {
			type: Array
		},
		allowDuplicates: {
			type: Boolean,
			default: false
		},
		localSource: {
			type: Array
		},
		localSourceField: {
			type: String,
			default: 'value'
		},
		remoteSource: {
			type: Boolean,
			default: false
		},
		remoteUrl: {
			type: String
		},
		method: {
			type: String,
			default: 'GET'
		},
		queryVariableName: {
			type: String,
			default: 'query'
		},
		id: {
			type: String
		}
	},

	data(){
		return {
			currentTag: '',
			tagSearchResults: [],
			duplicateFlag: false,
			searchSelectedIndex: -1,
			pauseSearch: false
		}
	},

	computed: {
		showAutocomplete: function(){
			return this.tagSearchResults.length == 0 ? false : true;
		},
		computedID: function(){
			return this.id != undefined ? this.id : '';
		}
	},

	methods: {
		searchTags: function(){
			if( !this.pauseSearch ){
				if( this.remoteSource ){
					this.$http.get(this.remoteUrl+'?'+this.queryVariableName+'='+this.currentTag, function( results ){
						if( this.currentTag != '' ){
							this.tagSearchResults = results;
							if( this.id != undefined ){
								document.getElementById('autocomplete-'+this.id).style.top = document.getElementById(this.id).offsetHeight + 'px';
							}else{
								document.getElementsByClassName('tag-autocomplete')[0].style.top = document.getElementsByClassName("tags-input")[0].offsetHeight + 'px';
							}
						}					
					}, function( error ){

					});
				}else{
					this.tagSearchResults = [];
					for( var i = 0; i < this.localSource.length; i++ ){
						if( this.localSource[i][this.localSourceField].includes( this.currentTag ) ){
							this.tagSearchResults.push( this.localSource[i] );
						}
					}
					if( this.id != undefined ){
						document.getElementById('autocomplete-'+this.id).style.top = document.getElementById(this.id).offsetHeight + 'px';
					}else{
						document.getElementsByClassName('tag-autocomplete')[0].style.top = document.getElementsByClassName("tags-input")[0].offsetHeight + 'px';
					}
				}
			}
		},

		selectTag: function( tag ){
			if( !this.checkDuplicates( tag.name ) ){
				this.tagsArray.push( tag );

				this.resetInputs();
			}else{
				this.duplicateFlag = true;
			}
		},

		addNewTag: function(){
			if( !this.checkDuplicates( this.currentTag ) ){
				if( this.searchSelectedIndex > -1 ){
					this.tagsArray.push( this.tagSearchResults[this.searchSelectedIndex] );
				}else{
					var newTag = {};

					newTag.name = this.currentTag.trim().replace(/[^a-zA-Z0-9]/g,'-');

					this.tagsArray.push( newTag );
				}
				
				this.resetInputs();
			}else{
				this.duplicateFlag = true;
			}
		},

		removeTag: function( tagIndex ){
			this.tagsArray.splice(tagIndex, 1);
		},

		changeIndex: function( direction ){
			this.pauseSearch = true;

			if( direction == 'up' && ( this.searchSelectedIndex -1 > -1 ) ){
				this.searchSelectedIndex = this.searchSelectedIndex - 1;
				this.currentTag = this.tagSearchResults[this.searchSelectedIndex].name;
			}

			if( direction == 'down' && ( this.searchSelectedIndex + 1 <= this.tagSearchResults.length - 1 ) ){
				this.searchSelectedIndex = this.searchSelectedIndex + 1;
				this.currentTag = this.tagSearchResults[this.searchSelectedIndex].name;
			}
		},

		resetInputs: function(){
			this.currentTag = '';
			this.tagSearchResults = [];
			this.duplicateFlag = false;
			this.searchSelectedIndex = -1;
			this.pauseSearch = false;
		},

		checkDuplicates: function( tagName ){
			if( !this.allowDuplicates ){
				tagName = tagName.trim().replace(/[^a-zA-Z0-9]/g,'-');

				for( var i = 0; i < this.tagsArray.length; i++ ){
					if( this.tagsArray[i].name == tagName ){
						return true;
					}
				}
			}

			return false;
		},

		focusTagInput: function(){
			if( this.id != undefined ){
				document.getElementById(this.id).focus();
			}else{
				document.getElementsByClassName("new-tag-input")[0].focus();
			}			
		},

		handleDelete: function(){
			this.duplicateFlag = false;
			this.pauseSearch = false;
			this.searchSelectedIndex = -1;

			if( this.currentTag.length == 0 ){
				this.tagsArray.splice( this.tagsArray.length - 1, 1);
			}
		}
	}
});

Vue.component('tags-input', TagsInput);