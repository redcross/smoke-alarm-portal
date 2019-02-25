'use strict';
var json2csv = require('json2csv');
var moment = require('moment');

exports.list = function(req, res, next) {
  var fields = [
    'county',
    'state',
    'chapter.name',
    'chapter.code',
    'chapter.activeRegion.region_name'
  ]
  var parser = new json2csv.Parser({ fields });
  req.app.db.SelectedCounties.findAll({
    order: [
      [req.app.db.chapter, req.app.db.activeRegion, 'region_name', 'asc'],
      ['county', 'asc']
    ],
    include: [
      { model: req.app.db.chapter,
        required: true,
        include: [
          {
            model: req.app.db.activeRegion,
            required: true
          }
        ] }
    ]
  })
    .then(counties => {
      var csv = parser.parse(counties);
      res.setHeader('Content-Type','application/csv');
      res.setHeader('Content-Disposition','attachment; filename=county-list-' + moment().format() + '.csv;');
      res.send(csv);
    });
}
