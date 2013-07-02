describe("Delete items", function() {

  var oldPadName,
      padName,
      path1,
      path2,
      path3,
      center1,
      center2,
      center3,
      reloaded = false,
      MENUBAR_HEIGHT = 36;

  it("creates a pad", function(done) {
    padName = helper.newPad(done);
    this.timeout(60000);
  });
  
  it("drawn paths are added to paperjs project", function(done) {
    this.timeout(1000);

    var chrome$ = helper.padChrome$;
    var paper = window.frames[0].paper;

    // Mouse clicks and drags to create path
    var canvas = chrome$("#myCanvas");
    canvas.simulate('drag', {dx: 100, dy: 100}); // Path 1
    canvas.simulate('drag', {dx: 0, dy: 200}); // Path 2
    canvas.simulate('drag', {dx: 200, dy: 0}); // Path 3

    helper.waitFor(function(){
      return window.frames[0].paper.project.activeLayer.children.length === 3; // wait until the three paths are drawn
    }, 2000).done(function(){
      var layer = paper.project.activeLayer;

      var numChildren = layer.children.length;
      if (numChildren !== 3) { // Expect three child nodes to be on canvas
        throw new Error("Wrong number of children in paper project. Found " + numChildren + " but expected 3");
      }

      var numSegments = layer.children[0]._segments.length;
      expect(numSegments).to.be(8); // Expect 8 segments for path 1
      numSegments = layer.children[1]._segments.length;
      expect(numSegments).to.be(12); // Expect 12 segments for path 2
      numSegments = layer.children[2]._segments.length;
      expect(numSegments).to.be(12); // Expect 12 segments for path 3
      oldPadName = padName;
      path1 = window.frames[0].paper.project.activeLayer.children[0]; // Save path1 for later test
      path2 = window.frames[0].paper.project.activeLayer.children[1]; // Save path2 for later test
      path3 = window.frames[0].paper.project.activeLayer.children[2]; // Save path3 for later test
      center1 = {x: path1.position.x, y: path1.position.y};
      center2 = {x: path2.position.x, y: path2.position.y};
      center3 = {x: path3.position.x, y: path3.position.y};
      done();
    });
  });

  it("reloads same pad", function(done) {
    this.timeout(60000);
    padName = helper.newPad(function() {
      var padsEqual = padName == oldPadName;
      if (padsEqual) {
        reloaded = true;
      }
      expect(padsEqual).to.be(true); // Expect old pad name to be new pad name (reloaded same pad)
      done();
    }, oldPadName);
  });
  
  it("selection tool selected (can't draw)", function(done) {
    this.timeout(60000);
    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 3) {
      throw new Error("Incorrect number of children in the project. Found " + numChildren + " but expected 3.");
    }

    var chrome$ = helper.padChrome$;
    chrome$("#selectTool").click();

    var canvas = chrome$("#myCanvas");
    // Path 4, draw in corner instead of center to not drag an existing path
    canvas.simulate('drag', {dx: 50, dy: 50, handle: 'corner'});
    numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren === 4) { // Expect the number of children to still be 3
      throw new Error("Select tool failed - drew new path after activating select tool.");
    }
    done();
  });
  
  it("doesn't delete anything when nothing is selected", function(done) {
    this.timeout(60000);
    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 3) {
      throw new Error("Incorrect number of children in the project. Found " + numChildren + " but expected 3.");
    }

    var chrome$ = helper.padChrome$;

    var canvas = chrome$("#myCanvas");
    // Simulate pressing the delete key
    canvas.simulate('keyDown', {key: 'delete'});
    canvas.simulate('keyUp', {key: 'delete'});
    numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 3) { // Expect the number of children to be 3
      throw new Error("Incorrect number of children in the project. Found " + numChildren + " but expected 3.");
    }
    done();
  });

  it("selects single path", function(done) {
    this.timeout(60000);

    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 3) {
      throw new Error("Incorrect number of children in project. Found " + numChildren + " but expected 3.");
    }
    if (!path1) {
      throw new Error("Path1 does not exist");
    }
    if (!path2) {
      throw new Error("Path2 does not exist");
    }
    if (!path3) {
      throw new Error("Path3 does not exist");
    }

    // Make sure nothing is selected
    window.frames[0].paper.project.activeLayer.selected = false;

    var chrome$ = helper.padChrome$;
    var canvas = chrome$("#myCanvas");
    // Simulate clicking path3
    var xclick = center3.x;
    var yclick = center3.y + MENUBAR_HEIGHT; // menu bar is 36 pixels
    canvas.simulate('mousedown', {clientX: xclick, clientY: yclick});
    canvas.simulate('mouseup', {clientX: xclick, clientY: yclick});

    var itemsSelected = window.frames[0].paper.project.selectedItems.length;
    if (itemsSelected !== 1) { // Expect only one path to be selected
      throw new Error("Items selected = " + itemsSelected + " instead of just 1.");
    }
    done();
  });
  
  it("deletes single path", function(done) {
    this.timeout(60000);

    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 3) {
      throw new Error("Incorrect number of children in project. Found " + numChildren + " but expected 3.");
    }
    if (!path1) {
      throw new Error("Path1 does not exist");
    }
    if (!path2) {
      throw new Error("Path2 does not exist");
    }
    if (!path3) {
      throw new Error("Path3 does not exist");
    }
    var itemsSelected = window.frames[0].paper.project.selectedItems.length;
    if (itemsSelected !== 1) { // Expect only one path to be selected
      throw new Error("Items selected = " + itemsSelected + " instead of just 1.");
    }

    // Make sure path 3 is selected
    if (window.frames[0].paper.project.activeLayer.children[2].selected == false) {
      window.frames[0].paper.project.activeLayer.selected = false; // Clear any selections
      window.frames[0].paper.project.activeLayer.children[2].selected = true;
    }

    var chrome$ = helper.padChrome$;

    var canvas = chrome$("#myCanvas");
    // Simulate pressing the delete key
	canvas.simulate('keydown', {keyCode: 46});
    canvas.simulate('keyup', {keyCode: 46});
    numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 2) { // Expect the number of children to be 2
      throw new Error("Incorrect number of children in the project. Found " + numChildren + " but expected 2.");
    }
    done();
  });

  it("selects multiple paths", function(done) {
    this.timeout(60000);

    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren < 2) {
      throw new Error("Incorrect number of children in project. Found " + numChildren + " but expected at least 2.");
    }
    if (!path1) {
      throw new Error("Path1 does not exist");
    }
    if (!path2) {
      throw new Error("Path2 does not exist");
    }

    // Make sure nothing is selected
    window.frames[0].paper.project.activeLayer.selected = false;

    var chrome$ = helper.padChrome$;
    var canvas = chrome$("#myCanvas");
    // Simulate clicking path1
    var xclick = center1.x;
    var yclick = center1.y + MENUBAR_HEIGHT; // menu bar is 36 pixels
    canvas.simulate('mousedown', {clientX: xclick, clientY: yclick});
    canvas.simulate('mouseup', {clientX: xclick, clientY: yclick});
    // Simulate clicking path2 while holding shift
    xclick = center2.x;
    yclick = center2.y + MENUBAR_HEIGHT; // menu bar is 36 pixels
    canvas.simulate('mousedown', {clientX: xclick, clientY: yclick, shiftKey: true});
    canvas.simulate('mouseup', {clientX: xclick, clientY: yclick, shiftKey: true});

    var itemsSelected = window.frames[0].paper.project.selectedItems.length;
    if (itemsSelected !== 2) { // Expect 2 paths to be selected
      throw new Error("Items selected = " + itemsSelected + " instead of 2.");
    }
    done();
  });

  it("deletes multiple paths", function(done) {
    this.timeout(60000);

    var numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 2) {
      throw new Error("Incorrect number of children in project. Found " + numChildren + " but expected 2.");
    }
    if (!path1) {
      throw new Error("Path1 does not exist");
    }
    if (!path2) {
      throw new Error("Path2 does not exist");
    }

    var chrome$ = helper.padChrome$;
    var canvas = chrome$("#myCanvas");
    // Simulate pressing the delete key
    canvas.simulate('keydown', {keyCode: 46});
    canvas.simulate('keyup', {keyCode: 46});
    numChildren = window.frames[0].paper.project.activeLayer.children.length;
    if (numChildren !== 0) { // Expect the number of children to be 0
      throw new Error("Incorrect number of children in the project. Found " + numChildren + " but expected 0.");
    }
    done();
  });

});