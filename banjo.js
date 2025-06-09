 const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const lineSpacing = 30;
    const startY = 30;
    const lineStart = 20;
    const lineEnd = 380;
    const tabStartX = 20;
    const tabStartY = 200;
    const measureWidth = 320;
    const margin = 20;
    const banjoTab = JSON.parse(document.getElementById('banjo-tab').textContent);
    const gap = 10;
    const nextLine = 300;

    let markers = [{ line: 1, x: (lineStart + lineEnd) / 2 }];

    function drawLineH(ctx, startX, endX, y) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawLineV(ctx, x, startY, endY, highlight) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        if (highlight) {
            ctx.strokeStyle = 'red';
        } else {
            ctx.strokeStyle = '#000';
        }
        ctx.lineWidth = 2;
        ctx.stroke();
    }

function drawCurve(ctx, startX, startY, endX, endY, controlX, controlY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawFiveLinesAtX(ctx, x, yStart) {
    for (let i = 0; i < 5; i++) {
        const y = yStart + i * lineSpacing;
        drawLineH(ctx, x, x + margin, y);
    }
}

function resetCursor() {
    banjoTab.state.cursor.measure = 0;
    banjoTab.state.cursor.note = 0;
    banjoTab.state.cursor.element = 0;

    const el = banjoTab.measures[0].notes[0][0];
    document.getElementById('fretInput').value = el.fret;
    document.getElementById('stringSelect').value = el.string;
    document.getElementById('noteSelect').value = el.note;
    draw();
}

function isNoteComplete(elements) {

    // Check if the sum of the inverses of the notes equals 0.25
    // elements: array of objects, each with a 'note' property (e.g., 4, 8, 16)
    const sum = elements.reduce((acc, el) => acc + 1 / el.note, 0);
    // Use a small epsilon to handle floating point precision
    return Math.abs(sum - 0.25) < 1e-8;
}

function isMeasureComplete(measure) {
    return measure.notes && measure.notes.length === 4;
}

function drawNoteLines(ctx, element, startX, newY, width, lineSpacing, gap, position, highlight) {
    const endX = startX + width;
    for (let i = 0; i < 5; i++) {
        const y = newY + i * lineSpacing;
        if (element.string === i + 1) {
        const textWidth = ctx.measureText(String(element.fret)).width;
            const breakStart = startX + width / 2 - textWidth / 2 - gap;
            const breakEnd = startX + width / 2 + textWidth / 2 + gap;
            if (element.note < 16) {
                drawLineH(ctx, startX, breakStart, y);
                drawLineH(ctx, breakEnd, endX, y);
            }
            ctx.textBaseline = 'middle';
            ctx.fillText(String(element.fret), startX + width / 2 - textWidth / 2, y);
            drawLineV(ctx, startX + width / 2, y + gap, y + (5 - i) * lineSpacing, highlight);

            if (element.note === 8) {
                if (position === 0) {
                   drawLineH(ctx, startX + width / 2, startX + width, y + (5 - i) * lineSpacing);
                } else {
                   drawLineH(ctx, startX, startX + width / 2, y + (5 - i) * lineSpacing);
                }
            }

            if (element.note === 16) {
                if (position === 0) {
                   drawLineH(ctx, startX + width / 2, startX + width, y + (5 - i) * lineSpacing);
                   drawLineH(ctx, startX + width / 2, startX + width, y + (5 - i) * lineSpacing - 5);
                }

                else if (position === 1) {
                   drawLineH(ctx, startX, startX + width, y + (5 - i) * lineSpacing);
                   drawLineH(ctx, startX, startX + width / 2, y + (5 - i) * lineSpacing - 5);
                }


                else if (position === 2) {
                   drawLineH(ctx, startX, startX + width, y + (5 - i) * lineSpacing);
                   drawLineH(ctx, startX + width / 2, startX + width, y + (5 - i) * lineSpacing - 5);
                }

                else if (position === 3) {
                   drawLineH(ctx, startX, startX + width / 2, y + (5 - i) * lineSpacing);
                   drawLineH(ctx, startX, startX + width / 2, y + (5 - i) * lineSpacing - 5);
                }
            }

        } else {
            drawLineH(ctx, startX, endX, y);
        }
    }
}

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';

        let newY = tabStartY;


        let startX = 20;
        let measureCount = 0;

        let measureIndex = -1;
        let noteIndex = -1;
        let elementIndex = -1;
        let highlight = false;
        let lastX = 0;

        drawLineV(ctx, startX, newY, newY + 4 * lineSpacing);

        for (measure of banjoTab.measures) {
        measureCount++;
        measureIndex++;
                drawFiveLinesAtX(ctx, startX, newY);
        startX += margin;
        noteIndex = -1;
        for (note of measure.notes) {
            let position = 0;
            noteIndex++;
            elementIndex = -1;
            for (element of note) {
                elementIndex++
                let width = measureWidth/element.note;



                if (elementIndex === banjoTab.state.cursor.element
                    && noteIndex === banjoTab.state.cursor.note
                    && measureIndex === banjoTab.state.cursor.measure) {
                    highlight = true;
                }
                drawNoteLines(ctx, element, startX, newY, width, lineSpacing, gap, position, highlight);

                if (element.link) {
                    const yCurve = newY + (element.string - 1) * lineSpacing - 15;
                    drawCurve(ctx, lastX, yCurve, startX + width/2, yCurve, (lastX + startX + width/2) / 2, yCurve - 20);

                    ctx.fillText(String(element.link),
                        (lastX + startX + width/2) / 2 - ctx.measureText(String(element.link)).width / 2,
                        yCurve - 30);
                }
                highlight = false;
                lastX = startX + width/2;
                startX += width;
                position += 16/element.note;
            }
        }
        drawFiveLinesAtX(ctx, startX, newY);
        startX += margin;
        drawLineV(ctx, startX, newY, newY + 4 * lineSpacing);
            if (measureCount % 4 === 0) {
                newY += nextLine; // Move down for next set of measures
                startX = 20; // Reset startX for the next set
            }
        }

    // At the end of your draw() function, add:
    document.getElementById('jsonBox').textContent = JSON.stringify(banjoTab, null, 2);
    }

    draw();

    document.getElementById('downloadPdfBtn').onclick = function() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: [canvas.width, canvas.height]
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('canvas.pdf');
    };

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const x = e.clientX - rect.left;


        const row = Math.floor((y - tabStartY) / nextLine);

        const measure = Math.floor((x - tabStartX) / (measureWidth + 2 * margin)) + row * 4;
        const posInMeasure = (x - tabStartX) % (measureWidth + 2 * margin);
        let note = 0;
        if (posInMeasure < measureWidth/4 + margin) {
            note = 0;
        } else if (posInMeasure < 2 * measureWidth/4 + margin) {
            note = 1;
        } else if (posInMeasure < 3 * measureWidth/4 + margin) {
            note = 2;
        } else {
            note = 3;
        }

        let element = 0;

        if (
            banjoTab.measures[measure] &&
            banjoTab.measures[measure].notes[note] &&
            banjoTab.measures[measure].notes[note].length > 1
        ) {

            let posInNote = (posInMeasure - margin) % (measureWidth / 4.0);

            if (posInNote < measureWidth/16) {

            } else if (posInNote < measureWidth/8) {
                if (banjoTab.measures[measure].notes[note][0].note == 16) {
                    element = 1;
                }
            } else if (posInNote < 3 * measureWidth/16) {
                if (banjoTab.measures[measure].notes[note][0].note == 16
                    && banjoTab.measures[measure].notes[note][1].note == 16
                    && banjoTab.measures[measure].notes[note].length > 2) {
                    element = 2;
                } else {
                    element = 1;
                }
            } else {
                element = banjoTab.measures[measure].notes[note].length - 1;
            }

            if (posInMeasure > measureWidth + margin) {
                element = banjoTab.measures[measure].notes[note].length - 1;
            }
        }

            // Update cursor state
        banjoTab.state.cursor.measure = measure;
        banjoTab.state.cursor.note = note;
        banjoTab.state.cursor.element = element;


  let fret = '';
  let string = '';
let noteValue = '';
let linkValue = '';
if (
    banjoTab.measures[measure] &&
    banjoTab.measures[measure].notes[note] &&
    banjoTab.measures[measure].notes[note][element]
) {
    fret = banjoTab.measures[measure].notes[note][element].fret;
    string = banjoTab.measures[measure].notes[note][element].string;
    noteValue = banjoTab.measures[measure].notes[note][element].note;
    linkValue = banjoTab.measures[measure].notes[note][element].link;
}
document.getElementById('fretInput').value = fret;
document.getElementById('stringSelect').value = string;
document.getElementById('noteSelect').value = noteValue;

        document.getElementById('linkSelect').value = linkValue;

        // Show modal
        document.getElementById('stringModal').style.display = 'block';
        draw();
    });

    document.getElementById('stringSelect').addEventListener('change', function() {
    const measure = banjoTab.state.cursor.measure;
    const note = banjoTab.state.cursor.note;
    const element = banjoTab.state.cursor.element;
    const newString = parseInt(this.value, 10);

    // Defensive: check measure/note/element exist
    if (
        banjoTab.measures[measure] &&
        banjoTab.measures[measure].notes[note] &&
        banjoTab.measures[measure].notes[note][element]
    ) {
        banjoTab.measures[measure].notes[note][element].string = newString;
        draw();
    }
});

    // Add event listener for fret input
document.getElementById('fretInput').addEventListener('change', function() {
    const measure = banjoTab.state.cursor.measure;
    const note = banjoTab.state.cursor.note;
    const element = banjoTab.state.cursor.element;
    const newFret = parseInt(this.value, 10);

    if (
        banjoTab.measures[measure] &&
        banjoTab.measures[measure].notes[note] &&
        banjoTab.measures[measure].notes[note][element]
    ) {
        banjoTab.measures[measure].notes[note][element].fret = newFret;
        draw();
    }
});

    // Add event listener for note select
document.getElementById('noteSelect').addEventListener('change', function() {
    const measure = banjoTab.state.cursor.measure;
    const note = banjoTab.state.cursor.note;
    const element = banjoTab.state.cursor.element;
    const newNote = parseInt(this.value, 10);

    if (
        banjoTab.measures[measure] &&
        banjoTab.measures[measure].notes[note] &&
        banjoTab.measures[measure].notes[note][element]
    ) {
        banjoTab.measures[measure].notes[note][element].note = newNote;
        draw();
    }
});

document.getElementById('linkSelect').addEventListener('change', function() {
    const measure = banjoTab.state.cursor.measure;
    const note = banjoTab.state.cursor.note;
    const element = banjoTab.state.cursor.element;
    const newLink = this.value;

    if (
        banjoTab.measures[measure] &&
        banjoTab.measures[measure].notes[note] &&
        banjoTab.measures[measure].notes[note][element]
    ) {
        banjoTab.measures[measure].notes[note][element].link = newLink;
        draw();
    }
});

function addAtEnd() {
    let measure = banjoTab.state.cursor.measure;
    let note = banjoTab.state.cursor.note;
    let element = banjoTab.state.cursor.element;

    const notes = banjoTab.measures[measure].notes;
    const currentNote = notes[note];

    if (!isNoteComplete(currentNote)) {
        // Add new element to current note
        const template = { ...currentNote[element] };
        template.fret = 0;
        currentNote.push(template);
        element = currentNote.length - 1;
    } else if (!isMeasureComplete(banjoTab.measures[measure])) {
        // Add new note to current measure
        const newNote = [{ ...currentNote[0], fret: 0 }];
        notes.push(newNote);
        note = notes.length - 1;
        element = 0;
    } else {
        // Add new measure
        const newMeasure = { notes: [[{ ...currentNote[0], fret: 0 }]] };
        banjoTab.measures.push(newMeasure);
        measure = banjoTab.measures.length - 1;
        note = 0;
        element = 0;
    }

    banjoTab.state.cursor.measure = measure;
    banjoTab.state.cursor.note = note;
    banjoTab.state.cursor.element = element;

    // Update modal fields
    const el = banjoTab.measures[measure].notes[note][element];
    document.getElementById('fretInput').value = el.fret;
    document.getElementById('stringSelect').value = el.string;
    document.getElementById('noteSelect').value = el.note;
    document.getElementById('linkSelect').value = el.link;
    draw();
}

 document.getElementById('nextElementBtn').addEventListener('click', function() {
    iterate(1);
});

 document.getElementById('backElementBtn').addEventListener('click', function() {
    iterate(-1);
});

function iterate(delta) {
    let measure = banjoTab.state.cursor.measure;
    let note = banjoTab.state.cursor.note;
    let element = banjoTab.state.cursor.element;

    if (delta > 0) {
        // Try next element
        if (
            banjoTab.measures[measure] &&
            banjoTab.measures[measure].notes[note] &&
            element + 1 < banjoTab.measures[measure].notes[note].length
        ) {
            element += 1;
        } else if (
            banjoTab.measures[measure] &&
            note + 1 < banjoTab.measures[measure].notes.length
        ) {
            note += 1;
            element = 0;
        } else if (
            measure + 1 < banjoTab.measures.length
        ) {
            measure += 1;
            note = 0;
            element = 0;
        } else {
            // At the end, do nothing

            addAtEnd();
            return;
        }
    } else if (delta < 0) {
        // Try previous element
        if (element - 1 >= 0) {
            element -= 1;
        } else if (note - 1 >= 0) {
            note -= 1;
            element = banjoTab.measures[measure].notes[note].length - 1;
        } else if (measure - 1 >= 0) {
            measure -= 1;
            note = banjoTab.measures[measure].notes.length - 1;
            element = banjoTab.measures[measure].notes[note].length - 1;
        } else {
            // At the start, do nothing
            return;
        }
    }

    banjoTab.state.cursor.measure = measure;
    banjoTab.state.cursor.note = note;
    banjoTab.state.cursor.element = element;

    // Update modal fields
    const el = banjoTab.measures[measure].notes[note][element];
    document.getElementById('fretInput').value = el.fret;
    document.getElementById('stringSelect').value = el.string;
    document.getElementById('noteSelect').value = el.note;
    document.getElementById('linkSelect').value = el.link;
    draw();
}

function cleanUp() {
    // Remove empty notes from each measure
    for (const measure of banjoTab.measures) {
        measure.notes = measure.notes.filter(note => note.length > 0);
    }
    // Remove measures with no notes
    banjoTab.measures = banjoTab.measures.filter(measure => measure.notes.length > 0);

    if (banjoTab.measures.length === 0) {
        // If all measures are removed, reset to initial state
        banjoTab.state.cursor.measure = 0;
        banjoTab.state.cursor.note = 0;
        banjoTab.state.cursor.element = 0;
        banjoTab.measures = [{ notes: [[{ fret: 0, string: 1, note: 4 }]] }];
    }

    if (banjoTab.measures.length === 1 && banjoTab.measures[0].notes.length === 0) {
        // If all notes are removed, reset to initial state
        banjoTab.state.cursor.measure = 0;
        banjoTab.state.cursor.note = 0;
        banjoTab.state.cursor.element = 0;
        banjoTab.measures = [{ notes: [[{ fret: 0, string: 1, note: 4 }]] }];
    }
}

document.getElementById('removeElementBtn').addEventListener('click', function() {
    let { measure, note, element } = banjoTab.state.cursor;
    const notes = banjoTab.measures[measure].notes;

    if (notes[note] && notes[note][element]) {
        notes[note].splice(element, 1);

        // If note is empty, remove the note
        if (notes[note].length === 0) {
            notes.splice(note, 1);
            // Adjust note index if needed
            if (note >= notes.length) note = notes.length - 1;
            element = 0;
        } else if (element >= notes[note].length) {
            element = notes[note].length - 1;
        }

        // If all notes are removed, close modal
        if (notes.length === 0) {
            document.getElementById('stringModal').style.display = 'none';
            draw();
            return;
        }

        cleanUp();

        banjoTab.state.cursor.measure = measure;
        banjoTab.state.cursor.note = note;
        banjoTab.state.cursor.element = element;

        // Update modal fields
        const el = notes[note][element];
        document.getElementById('fretInput').value = el.fret;
        document.getElementById('stringSelect').value = el.string;
        document.getElementById('noteSelect').value = el.note;
        document.getElementById('linkSelect').value = el.link;
        draw();
    }
});

    document.getElementById('afterElementBtn').addEventListener('click', function() {
    let { measure, note, element } = banjoTab.state.cursor;
    const notes = banjoTab.measures[measure].notes;
    const currentNote = notes[note];

    if (!isNoteComplete(currentNote)) {
        // Clone current element as template for new element
        const template = { ...currentNote[element] };
        // Optionally reset fret or other fields if desired
        template.fret = 0;

        // Insert after current element
        currentNote.splice(element + 1, 0, template);

        // Move cursor to new element
        banjoTab.state.cursor.element = element + 1;

        // Update modal fields
        document.getElementById('fretInput').value = template.fret;
        document.getElementById('stringSelect').value = template.string;
        document.getElementById('noteSelect').value = template.note;
        document.getElementById('linkSelect').value = template.link;
        draw();
    }
});

    // Make #stringModal draggable
const modal = document.getElementById('stringModal');
let isDragging = false, offsetX = 0, offsetY = 0;

modal.addEventListener('mousedown', function(e) {
    // Only drag if clicked on the modal, not on a button/input
    if (e.target !== modal) return;
    isDragging = true;
    offsetX = e.clientX - modal.offsetLeft;
    offsetY = e.clientY - modal.offsetTop;
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    modal.style.left = (e.clientX - offsetX) + 'px';
    modal.style.top = (e.clientY - offsetY) + 'px';
    modal.style.transform = 'none'; // Disable centering transform while dragging
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
});
    // Save JSON to file
document.getElementById('saveJsonBtn').onclick = function() {
    const dataStr = JSON.stringify(banjoTab, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'banjoTab.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Load JSON from file
document.getElementById('loadJsonBtn').onclick = function() {
    document.getElementById('jsonFileInput').click();
};

document.getElementById('jsonFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const obj = JSON.parse(evt.target.result);
            Object.assign(banjoTab, obj);
            draw();
        } catch (err) {
            alert('Invalid JSON file.');
        }
    };
    reader.readAsText(file);
});

document.getElementById('cleanUpBtn').onclick = function() {
    cleanUp();
    draw();
};