"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const linked_list_1 = require("./linked-list");
class IndexOutOfBoundException extends core_1.BaseException {
    constructor(index, min, max = Infinity) {
        super(`Index ${index} outside of range [${min}, ${max}].`);
    }
}
exports.IndexOutOfBoundException = IndexOutOfBoundException;
class ContentCannotBeRemovedException extends core_1.BaseException {
    constructor() {
        super(`User tried to remove content that was marked essential.`);
    }
}
exports.ContentCannotBeRemovedException = ContentCannotBeRemovedException;
/**
 * A Chunk description, including left/right content that has been inserted.
 * If _left/_right is null, this means that content was deleted. If the _content is null,
 * it means the content itself was deleted.
 *
 * @see UpdateBuffer
 */
class Chunk {
    constructor(start, end, originalContent) {
        this.start = start;
        this.end = end;
        this.originalContent = originalContent;
        this._left = Buffer.alloc(0);
        this._right = Buffer.alloc(0);
        this._assertLeft = false;
        this._assertRight = false;
        this.next = null;
        this._content = originalContent.slice(start, end);
    }
    get length() {
        return (this._left ? this._left.length : 0)
            + (this._content ? this._content.length : 0)
            + (this._right ? this._right.length : 0);
    }
    toString(encoding = 'utf-8') {
        return (this._left ? this._left.toString(encoding) : '')
            + (this._content ? this._content.toString(encoding) : '')
            + (this._right ? this._right.toString(encoding) : '');
    }
    slice(start) {
        if (start < this.start || start > this.end) {
            throw new IndexOutOfBoundException(start, this.start, this.end);
        }
        // Update _content to the new indices.
        const newChunk = new Chunk(start, this.end, this.originalContent);
        // If this chunk has _content, reslice the original _content. We move the _right so we are not
        // losing any data here. If this chunk has been deleted, the next chunk should also be deleted.
        if (this._content) {
            this._content = this.originalContent.slice(this.start, start);
        }
        else {
            newChunk._content = this._content;
            if (this._right === null) {
                newChunk._left = null;
            }
        }
        this.end = start;
        // Move _right to the new chunk.
        newChunk._right = this._right;
        this._right = this._right && Buffer.alloc(0);
        // Update essentials.
        if (this._assertRight) {
            newChunk._assertRight = true;
            this._assertRight = false;
        }
        // Update the linked list.
        newChunk.next = this.next;
        this.next = newChunk;
        return newChunk;
    }
    append(buffer, essential) {
        if (!this._right) {
            if (essential) {
                throw new ContentCannotBeRemovedException();
            }
            return;
        }
        const outro = this._right;
        this._right = Buffer.alloc(outro.length + buffer.length);
        outro.copy(this._right, 0);
        buffer.copy(this._right, outro.length);
        if (essential) {
            this._assertRight = true;
        }
    }
    prepend(buffer, essential) {
        if (!this._left) {
            if (essential) {
                throw new ContentCannotBeRemovedException();
            }
            return;
        }
        const intro = this._left;
        this._left = Buffer.alloc(intro.length + buffer.length);
        intro.copy(this._left, 0);
        buffer.copy(this._left, intro.length);
        if (essential) {
            this._assertLeft = true;
        }
    }
    assert(left, _content, right) {
        if (left) {
            if (this._assertLeft) {
                throw new ContentCannotBeRemovedException();
            }
        }
        if (right) {
            if (this._assertRight) {
                throw new ContentCannotBeRemovedException();
            }
        }
    }
    remove(left, content, right) {
        if (left) {
            if (this._assertLeft) {
                throw new ContentCannotBeRemovedException();
            }
            this._left = null;
        }
        if (content) {
            this._content = null;
        }
        if (right) {
            if (this._assertRight) {
                throw new ContentCannotBeRemovedException();
            }
            this._right = null;
        }
    }
    copy(target, start) {
        if (this._left) {
            this._left.copy(target, start);
            start += this._left.length;
        }
        if (this._content) {
            this._content.copy(target, start);
            start += this._content.length;
        }
        if (this._right) {
            this._right.copy(target, start);
            start += this._right.length;
        }
        return start;
    }
}
exports.Chunk = Chunk;
/**
 * An utility class that allows buffers to be inserted to the _right or _left, or deleted, while
 * keeping indices to the original buffer.
 *
 * The constructor takes an original buffer, and keeps it into a linked list of chunks, smaller
 * buffers that keep track of _content inserted to the _right or _left of it.
 *
 * Since the Node Buffer structure is non-destructive when slicing, we try to use slicing to create
 * new chunks, and always keep chunks pointing to the original content.
 */
class UpdateBuffer {
    constructor(_originalContent) {
        this._originalContent = _originalContent;
        this._linkedList = new linked_list_1.LinkedList(new Chunk(0, _originalContent.length, _originalContent));
    }
    _assertIndex(index) {
        if (index < 0 || index > this._originalContent.length) {
            throw new IndexOutOfBoundException(index, 0, this._originalContent.length);
        }
    }
    _slice(start) {
        this._assertIndex(start);
        // Find the chunk by going through the list.
        const h = this._linkedList.find(chunk => start <= chunk.end);
        if (!h) {
            throw Error('Chunk cannot be found.');
        }
        if (start == h.end && h.next !== null) {
            return [h, h.next];
        }
        return [h, h.slice(start)];
    }
    get length() {
        return this._linkedList.reduce((acc, chunk) => acc + chunk.length, 0);
    }
    get original() {
        return this._originalContent;
    }
    toString(encoding = 'utf-8') {
        return this._linkedList.reduce((acc, chunk) => acc + chunk.toString(encoding), '');
    }
    generate() {
        const result = Buffer.allocUnsafe(this.length);
        let i = 0;
        this._linkedList.forEach(chunk => {
            chunk.copy(result, i);
            i += chunk.length;
        });
        return result;
    }
    insertLeft(index, content, assert = false) {
        this._slice(index)[0].append(content, assert);
    }
    insertRight(index, content, assert = false) {
        this._slice(index)[1].prepend(content, assert);
    }
    remove(index, length) {
        const end = index + length;
        const first = this._slice(index)[1];
        const last = this._slice(end)[1];
        let curr;
        for (curr = first; curr && curr !== last; curr = curr.next) {
            curr.assert(curr !== first, curr !== last, curr === first);
        }
        for (curr = first; curr && curr !== last; curr = curr.next) {
            curr.remove(curr !== first, curr !== last, curr === first);
        }
        if (curr) {
            curr.remove(true, false, false);
        }
    }
}
exports.UpdateBuffer = UpdateBuffer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWJ1ZmZlci5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvaGFuc2wvU291cmNlcy9oYW5zbC9kZXZraXQvIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9zY2hlbWF0aWNzL3NyYy91dGlsaXR5L3VwZGF0ZS1idWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FBcUQ7QUFDckQsK0NBQTJDO0FBRzNDLDhCQUFzQyxTQUFRLG9CQUFhO0lBQ3pELFlBQVksS0FBYSxFQUFFLEdBQVcsRUFBRSxHQUFHLEdBQUcsUUFBUTtRQUNwRCxLQUFLLENBQUMsU0FBUyxLQUFLLHNCQUFzQixHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0Y7QUFKRCw0REFJQztBQUNELHFDQUE2QyxTQUFRLG9CQUFhO0lBQ2hFO1FBQ0UsS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFDbkUsQ0FBQztDQUNGO0FBSkQsMEVBSUM7QUFHRDs7Ozs7O0dBTUc7QUFDSDtJQVVFLFlBQW1CLEtBQWEsRUFBUyxHQUFXLEVBQVMsZUFBdUI7UUFBakUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxvQkFBZSxHQUFmLGVBQWUsQ0FBUTtRQVI1RSxVQUFLLEdBQWtCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsV0FBTSxHQUFrQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXhDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRTdCLFNBQUksR0FBaUIsSUFBSSxDQUFDO1FBR3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELElBQUksTUFBTTtRQUNS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LEdBQUcsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxJQUFJLElBQWtCLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBM0VELG9DQTJFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IEJhc2VFeGNlcHRpb24gfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBMaW5rZWRMaXN0IH0gZnJvbSAnLi9saW5rZWQtbGlzdCc7XG5cblxuZXhwb3J0IGNsYXNzIEluZGV4T3V0T2ZCb3VuZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4ID0gSW5maW5pdHkpIHtcbiAgICBzdXBlcihgSW5kZXggJHtpbmRleH0gb3V0c2lkZSBvZiByYW5nZSBbJHttaW59LCAke21heH1dLmApO1xuICB9XG59XG5leHBvcnQgY2xhc3MgQ29udGVudENhbm5vdEJlUmVtb3ZlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgVXNlciB0cmllZCB0byByZW1vdmUgY29udGVudCB0aGF0IHdhcyBtYXJrZWQgZXNzZW50aWFsLmApO1xuICB9XG59XG5cblxuLyoqXG4gKiBBIENodW5rIGRlc2NyaXB0aW9uLCBpbmNsdWRpbmcgbGVmdC9yaWdodCBjb250ZW50IHRoYXQgaGFzIGJlZW4gaW5zZXJ0ZWQuXG4gKiBJZiBfbGVmdC9fcmlnaHQgaXMgbnVsbCwgdGhpcyBtZWFucyB0aGF0IGNvbnRlbnQgd2FzIGRlbGV0ZWQuIElmIHRoZSBfY29udGVudCBpcyBudWxsLFxuICogaXQgbWVhbnMgdGhlIGNvbnRlbnQgaXRzZWxmIHdhcyBkZWxldGVkLlxuICpcbiAqIEBzZWUgVXBkYXRlQnVmZmVyXG4gKi9cbmV4cG9ydCBjbGFzcyBDaHVuayB7XG4gIHByaXZhdGUgX2NvbnRlbnQ6IEJ1ZmZlciB8IG51bGw7XG4gIHByaXZhdGUgX2xlZnQ6IEJ1ZmZlciB8IG51bGwgPSBCdWZmZXIuYWxsb2MoMCk7XG4gIHByaXZhdGUgX3JpZ2h0OiBCdWZmZXIgfCBudWxsID0gQnVmZmVyLmFsbG9jKDApO1xuXG4gIHByaXZhdGUgX2Fzc2VydExlZnQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfYXNzZXJ0UmlnaHQgPSBmYWxzZTtcblxuICBuZXh0OiBDaHVuayB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGFydDogbnVtYmVyLCBwdWJsaWMgZW5kOiBudW1iZXIsIHB1YmxpYyBvcmlnaW5hbENvbnRlbnQ6IEJ1ZmZlcikge1xuICAgIHRoaXMuX2NvbnRlbnQgPSBvcmlnaW5hbENvbnRlbnQuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiAodGhpcy5fbGVmdCA/IHRoaXMuX2xlZnQubGVuZ3RoIDogMClcbiAgICAgICAgICsgKHRoaXMuX2NvbnRlbnQgPyB0aGlzLl9jb250ZW50Lmxlbmd0aCA6IDApXG4gICAgICAgICArICh0aGlzLl9yaWdodCA/IHRoaXMuX3JpZ2h0Lmxlbmd0aCA6IDApO1xuICB9XG4gIHRvU3RyaW5nKGVuY29kaW5nID0gJ3V0Zi04Jykge1xuICAgIHJldHVybiAodGhpcy5fbGVmdCA/IHRoaXMuX2xlZnQudG9TdHJpbmcoZW5jb2RpbmcpIDogJycpXG4gICAgICAgICArICh0aGlzLl9jb250ZW50ID8gdGhpcy5fY29udGVudC50b1N0cmluZyhlbmNvZGluZykgOiAnJylcbiAgICAgICAgICsgKHRoaXMuX3JpZ2h0ID8gdGhpcy5fcmlnaHQudG9TdHJpbmcoZW5jb2RpbmcpIDogJycpO1xuICB9XG5cbiAgc2xpY2Uoc3RhcnQ6IG51bWJlcikge1xuICAgIGlmIChzdGFydCA8IHRoaXMuc3RhcnQgfHwgc3RhcnQgPiB0aGlzLmVuZCkge1xuICAgICAgdGhyb3cgbmV3IEluZGV4T3V0T2ZCb3VuZEV4Y2VwdGlvbihzdGFydCwgdGhpcy5zdGFydCwgdGhpcy5lbmQpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBfY29udGVudCB0byB0aGUgbmV3IGluZGljZXMuXG4gICAgY29uc3QgbmV3Q2h1bmsgPSBuZXcgQ2h1bmsoc3RhcnQsIHRoaXMuZW5kLCB0aGlzLm9yaWdpbmFsQ29udGVudCk7XG5cbiAgICAvLyBJZiB0aGlzIGNodW5rIGhhcyBfY29udGVudCwgcmVzbGljZSB0aGUgb3JpZ2luYWwgX2NvbnRlbnQuIFdlIG1vdmUgdGhlIF9yaWdodCBzbyB3ZSBhcmUgbm90XG4gICAgLy8gbG9zaW5nIGFueSBkYXRhIGhlcmUuIElmIHRoaXMgY2h1bmsgaGFzIGJlZW4gZGVsZXRlZCwgdGhlIG5leHQgY2h1bmsgc2hvdWxkIGFsc28gYmUgZGVsZXRlZC5cbiAgICBpZiAodGhpcy5fY29udGVudCkge1xuICAgICAgdGhpcy5fY29udGVudCA9IHRoaXMub3JpZ2luYWxDb250ZW50LnNsaWNlKHRoaXMuc3RhcnQsIHN0YXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3Q2h1bmsuX2NvbnRlbnQgPSB0aGlzLl9jb250ZW50O1xuICAgICAgaWYgKHRoaXMuX3JpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgIG5ld0NodW5rLl9sZWZ0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbmQgPSBzdGFydDtcblxuICAgIC8vIE1vdmUgX3JpZ2h0IHRvIHRoZSBuZXcgY2h1bmsuXG4gICAgbmV3Q2h1bmsuX3JpZ2h0ID0gdGhpcy5fcmlnaHQ7XG4gICAgdGhpcy5fcmlnaHQgPSB0aGlzLl9yaWdodCAmJiBCdWZmZXIuYWxsb2MoMCk7XG5cbiAgICAvLyBVcGRhdGUgZXNzZW50aWFscy5cbiAgICBpZiAodGhpcy5fYXNzZXJ0UmlnaHQpIHtcbiAgICAgIG5ld0NodW5rLl9hc3NlcnRSaWdodCA9IHRydWU7XG4gICAgICB0aGlzLl9hc3NlcnRSaWdodCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgbGlua2VkIGxpc3QuXG4gICAgbmV3Q2h1bmsubmV4dCA9IHRoaXMubmV4dDtcbiAgICB0aGlzLm5leHQgPSBuZXdDaHVuaztcblxuICAgIHJldHVybiBuZXdDaHVuaztcbiAgfVxuXG4gIGFwcGVuZChidWZmZXI6IEJ1ZmZlciwgZXNzZW50aWFsOiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLl9yaWdodCkge1xuICAgICAgaWYgKGVzc2VudGlhbCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29udGVudENhbm5vdEJlUmVtb3ZlZEV4Y2VwdGlvbigpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cm8gPSB0aGlzLl9yaWdodDtcbiAgICB0aGlzLl9yaWdodCA9IEJ1ZmZlci5hbGxvYyhvdXRyby5sZW5ndGggKyBidWZmZXIubGVuZ3RoKTtcbiAgICBvdXRyby5jb3B5KHRoaXMuX3JpZ2h0LCAwKTtcbiAgICBidWZmZXIuY29weSh0aGlzLl9yaWdodCwgb3V0cm8ubGVuZ3RoKTtcblxuICAgIGlmIChlc3NlbnRpYWwpIHtcbiAgICAgIHRoaXMuX2Fzc2VydFJpZ2h0ID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcHJlcGVuZChidWZmZXI6IEJ1ZmZlciwgZXNzZW50aWFsOiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLl9sZWZ0KSB7XG4gICAgICBpZiAoZXNzZW50aWFsKSB7XG4gICAgICAgIHRocm93IG5ldyBDb250ZW50Q2Fubm90QmVSZW1vdmVkRXhjZXB0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbnRybyA9IHRoaXMuX2xlZnQ7XG4gICAgdGhpcy5fbGVmdCA9IEJ1ZmZlci5hbGxvYyhpbnRyby5sZW5ndGggKyBidWZmZXIubGVuZ3RoKTtcbiAgICBpbnRyby5jb3B5KHRoaXMuX2xlZnQsIDApO1xuICAgIGJ1ZmZlci5jb3B5KHRoaXMuX2xlZnQsIGludHJvLmxlbmd0aCk7XG5cbiAgICBpZiAoZXNzZW50aWFsKSB7XG4gICAgICB0aGlzLl9hc3NlcnRMZWZ0ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBhc3NlcnQobGVmdDogYm9vbGVhbiwgX2NvbnRlbnQ6IGJvb2xlYW4sIHJpZ2h0OiBib29sZWFuKSB7XG4gICAgaWYgKGxlZnQpIHtcbiAgICAgIGlmICh0aGlzLl9hc3NlcnRMZWZ0KSB7XG4gICAgICAgIHRocm93IG5ldyBDb250ZW50Q2Fubm90QmVSZW1vdmVkRXhjZXB0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyaWdodCkge1xuICAgICAgaWYgKHRoaXMuX2Fzc2VydFJpZ2h0KSB7XG4gICAgICAgIHRocm93IG5ldyBDb250ZW50Q2Fubm90QmVSZW1vdmVkRXhjZXB0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlKGxlZnQ6IGJvb2xlYW4sIGNvbnRlbnQ6IGJvb2xlYW4sIHJpZ2h0OiBib29sZWFuKSB7XG4gICAgaWYgKGxlZnQpIHtcbiAgICAgIGlmICh0aGlzLl9hc3NlcnRMZWZ0KSB7XG4gICAgICAgIHRocm93IG5ldyBDb250ZW50Q2Fubm90QmVSZW1vdmVkRXhjZXB0aW9uKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9sZWZ0ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIHRoaXMuX2NvbnRlbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAocmlnaHQpIHtcbiAgICAgIGlmICh0aGlzLl9hc3NlcnRSaWdodCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29udGVudENhbm5vdEJlUmVtb3ZlZEV4Y2VwdGlvbigpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmlnaHQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGNvcHkodGFyZ2V0OiBCdWZmZXIsIHN0YXJ0OiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5fbGVmdCkge1xuICAgICAgdGhpcy5fbGVmdC5jb3B5KHRhcmdldCwgc3RhcnQpO1xuICAgICAgc3RhcnQgKz0gdGhpcy5fbGVmdC5sZW5ndGg7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jb250ZW50KSB7XG4gICAgICB0aGlzLl9jb250ZW50LmNvcHkodGFyZ2V0LCBzdGFydCk7XG4gICAgICBzdGFydCArPSB0aGlzLl9jb250ZW50Lmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3JpZ2h0KSB7XG4gICAgICB0aGlzLl9yaWdodC5jb3B5KHRhcmdldCwgc3RhcnQpO1xuICAgICAgc3RhcnQgKz0gdGhpcy5fcmlnaHQubGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFydDtcbiAgfVxufVxuXG5cbi8qKlxuICogQW4gdXRpbGl0eSBjbGFzcyB0aGF0IGFsbG93cyBidWZmZXJzIHRvIGJlIGluc2VydGVkIHRvIHRoZSBfcmlnaHQgb3IgX2xlZnQsIG9yIGRlbGV0ZWQsIHdoaWxlXG4gKiBrZWVwaW5nIGluZGljZXMgdG8gdGhlIG9yaWdpbmFsIGJ1ZmZlci5cbiAqXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYW4gb3JpZ2luYWwgYnVmZmVyLCBhbmQga2VlcHMgaXQgaW50byBhIGxpbmtlZCBsaXN0IG9mIGNodW5rcywgc21hbGxlclxuICogYnVmZmVycyB0aGF0IGtlZXAgdHJhY2sgb2YgX2NvbnRlbnQgaW5zZXJ0ZWQgdG8gdGhlIF9yaWdodCBvciBfbGVmdCBvZiBpdC5cbiAqXG4gKiBTaW5jZSB0aGUgTm9kZSBCdWZmZXIgc3RydWN0dXJlIGlzIG5vbi1kZXN0cnVjdGl2ZSB3aGVuIHNsaWNpbmcsIHdlIHRyeSB0byB1c2Ugc2xpY2luZyB0byBjcmVhdGVcbiAqIG5ldyBjaHVua3MsIGFuZCBhbHdheXMga2VlcCBjaHVua3MgcG9pbnRpbmcgdG8gdGhlIG9yaWdpbmFsIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGRhdGVCdWZmZXIge1xuICBwcm90ZWN0ZWQgX2xpbmtlZExpc3Q6IExpbmtlZExpc3Q8Q2h1bms+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfb3JpZ2luYWxDb250ZW50OiBCdWZmZXIpIHtcbiAgICB0aGlzLl9saW5rZWRMaXN0ID0gbmV3IExpbmtlZExpc3QobmV3IENodW5rKDAsIF9vcmlnaW5hbENvbnRlbnQubGVuZ3RoLCBfb3JpZ2luYWxDb250ZW50KSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Fzc2VydEluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5fb3JpZ2luYWxDb250ZW50Lmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEluZGV4T3V0T2ZCb3VuZEV4Y2VwdGlvbihpbmRleCwgMCwgdGhpcy5fb3JpZ2luYWxDb250ZW50Lmxlbmd0aCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIF9zbGljZShzdGFydDogbnVtYmVyKTogW0NodW5rLCBDaHVua10ge1xuICAgIHRoaXMuX2Fzc2VydEluZGV4KHN0YXJ0KTtcblxuICAgIC8vIEZpbmQgdGhlIGNodW5rIGJ5IGdvaW5nIHRocm91Z2ggdGhlIGxpc3QuXG4gICAgY29uc3QgaCA9IHRoaXMuX2xpbmtlZExpc3QuZmluZChjaHVuayA9PiBzdGFydCA8PSBjaHVuay5lbmQpO1xuICAgIGlmICghaCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0NodW5rIGNhbm5vdCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPT0gaC5lbmQgJiYgaC5uZXh0ICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW2gsIGgubmV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIFtoLCBoLnNsaWNlKHN0YXJ0KV07XG4gIH1cblxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmtlZExpc3QucmVkdWNlKChhY2MsIGNodW5rKSA9PiBhY2MgKyBjaHVuay5sZW5ndGgsIDApO1xuICB9XG4gIGdldCBvcmlnaW5hbCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbENvbnRlbnQ7XG4gIH1cblxuICB0b1N0cmluZyhlbmNvZGluZyA9ICd1dGYtOCcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9saW5rZWRMaXN0LnJlZHVjZSgoYWNjLCBjaHVuaykgPT4gYWNjICsgY2h1bmsudG9TdHJpbmcoZW5jb2RpbmcpLCAnJyk7XG4gIH1cbiAgZ2VuZXJhdGUoKTogQnVmZmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSBCdWZmZXIuYWxsb2NVbnNhZmUodGhpcy5sZW5ndGgpO1xuICAgIGxldCBpID0gMDtcbiAgICB0aGlzLl9saW5rZWRMaXN0LmZvckVhY2goY2h1bmsgPT4ge1xuICAgICAgY2h1bmsuY29weShyZXN1bHQsIGkpO1xuICAgICAgaSArPSBjaHVuay5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaW5zZXJ0TGVmdChpbmRleDogbnVtYmVyLCBjb250ZW50OiBCdWZmZXIsIGFzc2VydCA9IGZhbHNlKSB7XG4gICAgdGhpcy5fc2xpY2UoaW5kZXgpWzBdLmFwcGVuZChjb250ZW50LCBhc3NlcnQpO1xuICB9XG4gIGluc2VydFJpZ2h0KGluZGV4OiBudW1iZXIsIGNvbnRlbnQ6IEJ1ZmZlciwgYXNzZXJ0ID0gZmFsc2UpIHtcbiAgICB0aGlzLl9zbGljZShpbmRleClbMV0ucHJlcGVuZChjb250ZW50LCBhc3NlcnQpO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4OiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKSB7XG4gICAgY29uc3QgZW5kID0gaW5kZXggKyBsZW5ndGg7XG5cbiAgICBjb25zdCBmaXJzdCA9IHRoaXMuX3NsaWNlKGluZGV4KVsxXTtcbiAgICBjb25zdCBsYXN0ID0gdGhpcy5fc2xpY2UoZW5kKVsxXTtcblxuICAgIGxldCBjdXJyOiBDaHVuayB8IG51bGw7XG4gICAgZm9yIChjdXJyID0gZmlyc3Q7IGN1cnIgJiYgY3VyciAhPT0gbGFzdDsgY3VyciA9IGN1cnIubmV4dCkge1xuICAgICAgY3Vyci5hc3NlcnQoY3VyciAhPT0gZmlyc3QsIGN1cnIgIT09IGxhc3QsIGN1cnIgPT09IGZpcnN0KTtcbiAgICB9XG4gICAgZm9yIChjdXJyID0gZmlyc3Q7IGN1cnIgJiYgY3VyciAhPT0gbGFzdDsgY3VyciA9IGN1cnIubmV4dCkge1xuICAgICAgY3Vyci5yZW1vdmUoY3VyciAhPT0gZmlyc3QsIGN1cnIgIT09IGxhc3QsIGN1cnIgPT09IGZpcnN0KTtcbiAgICB9XG5cbiAgICBpZiAoY3Vycikge1xuICAgICAgY3Vyci5yZW1vdmUodHJ1ZSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==