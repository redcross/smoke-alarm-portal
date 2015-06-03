window.addTwitterWidget = function(type, options) {
	var options = {
			"type" :            type
			,"id" :             options.id || null
			,"user" :           options.user || 'redcross'
			,"search" :         options.search || null
			,"title":           options.title || 'American Red Cross'
			,"subject":         options.subject || 'RedCross'
			,"posts" :          options.posts || type == 'search' ? 30 : 4
			,"interval" :       options.interval || 30000
			,"width" :          options.width || 'auto'
			,"height" :         options.height || null
			,"scrollbar" :      options.scrollbar || false
			,"loop" :           options.loop || false
			,"live" :           options.live || true
			,"behavior" :       options.behavior || 'all'
		},
		widget = new TWTR.Widget({
			version:            2
			,id:                options.id
			,type:              options.type
			,search:            options.search
			,title:             options.title
			,subject:           options.subject
			,rpp:               options.posts
			,interval:          options.interval
			,width:             options.width
			,height:            options.height
			,theme: {
				shell: {
					background: '#ed1b2c'
					,color:     '#ffffff'
				}
				,tweets: {
					background: '#ffffff'
					,color:     '#333333'
					,links:     '#26678d'
				}
			}
			,features: {
				scrollbar:      options.scrollbar
				,loop:          options.loop
				,live:          options.live
				,behavior:      options.behavior
			}
		});

	if (type == 'search') {
		widget.render().start();
	} else {
		widget.render().setUser(options.user).start();
	}
}
