"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const schematics_1 = require("@angular-devkit/schematics");
const of_1 = require("rxjs/observable/of");
const throw_1 = require("rxjs/observable/throw");
const mergeMap_1 = require("rxjs/operators/mergeMap");
/**
 * An EngineHost that support multiple hosts in a fallback configuration. If a host does not
 * have a collection/schematics, use the following host before giving up.
 */
class FallbackEngineHost {
    constructor() {
        this._hosts = [];
    }
    addHost(host) {
        this._hosts.push(host);
    }
    createCollectionDescription(name) {
        for (const host of this._hosts) {
            try {
                const description = host.createCollectionDescription(name);
                return { name, host, description };
            }
            catch (_) {
            }
        }
        throw new schematics_1.UnknownCollectionException(name);
    }
    createSchematicDescription(name, collection) {
        const description = collection.host.createSchematicDescription(name, collection.description);
        return { name, collection, description };
    }
    getSchematicRuleFactory(schematic, collection) {
        return collection.host.getSchematicRuleFactory(schematic.description, collection.description);
    }
    createSourceFromUrl(url, context) {
        return context.schematic.collection.description.host.createSourceFromUrl(url, context);
    }
    transformOptions(schematic, options) {
        return (of_1.of(options)
            .pipe(...this._hosts.map(host => mergeMap_1.mergeMap(opt => host.transformOptions(schematic, opt)))));
    }
    /**
     * @deprecated Use `listSchematicNames`.
     */
    listSchematics(collection) {
        return this.listSchematicNames(collection.description);
    }
    listSchematicNames(collection) {
        const allNames = new Set();
        this._hosts.forEach(host => {
            try {
                host.listSchematicNames(collection.description).forEach(name => allNames.add(name));
            }
            catch (_) { }
        });
        return [...allNames];
    }
    createTaskExecutor(name) {
        for (const host of this._hosts) {
            if (host.hasTaskExecutor(name)) {
                return host.createTaskExecutor(name);
            }
        }
        return throw_1._throw(new schematics_1.UnregisteredTaskException(name));
    }
    hasTaskExecutor(name) {
        for (const host of this._hosts) {
            if (host.hasTaskExecutor(name)) {
                return true;
            }
        }
        return false;
    }
}
exports.FallbackEngineHost = FallbackEngineHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFsbGJhY2stZW5naW5lLWhvc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2hhbnNsL1NvdXJjZXMvaGFuc2wvZGV2a2l0LyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy90b29scy9mYWxsYmFjay1lbmdpbmUtaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILDJEQVdvQztBQUVwQywyQ0FBd0Q7QUFDeEQsaURBQStDO0FBQy9DLHNEQUFtRDtBQWlCbkQ7OztHQUdHO0FBQ0g7SUFHRTtRQUZRLFdBQU0sR0FBeUIsRUFBRSxDQUFDO0lBRTNCLENBQUM7SUFFaEIsT0FBTyxDQUNMLElBQXlDO1FBRXpDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxJQUFZO1FBQ3RDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQztnQkFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTNELE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sSUFBSSx1Q0FBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsMEJBQTBCLENBQ3hCLElBQVksRUFDWixVQUFnRTtRQUVoRSxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFN0YsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsdUJBQXVCLENBQ3JCLFNBQTRGLEVBQzVGLFVBQWdFO1FBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxtQkFBbUIsQ0FDakIsR0FBUSxFQUNSLE9BQTJGO1FBRTNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsZ0JBQWdCLENBQ2QsU0FBNEYsRUFDNUYsT0FBZ0I7UUFFaEIsTUFBTSxDQUFDLENBQUMsT0FBWSxDQUFDLE9BQU8sQ0FBQzthQUMxQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FDWixVQUFtRjtRQUVuRixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBZ0U7UUFDakYsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsa0JBQWtCLENBQUMsSUFBWTtRQUM3QixHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxjQUFNLENBQUMsSUFBSSxzQ0FBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxlQUFlLENBQUMsSUFBWTtRQUMxQixHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FFRjtBQS9GRCxnREErRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBDb2xsZWN0aW9uLFxuICBDb2xsZWN0aW9uRGVzY3JpcHRpb24sXG4gIEVuZ2luZUhvc3QsXG4gIFJ1bGVGYWN0b3J5LFxuICBTY2hlbWF0aWNEZXNjcmlwdGlvbixcbiAgU291cmNlLFxuICBUYXNrRXhlY3V0b3IsXG4gIFR5cGVkU2NoZW1hdGljQ29udGV4dCxcbiAgVW5rbm93bkNvbGxlY3Rpb25FeGNlcHRpb24sXG4gIFVucmVnaXN0ZXJlZFRhc2tFeGNlcHRpb24sXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgb2YgYXMgb2JzZXJ2YWJsZU9mIH0gZnJvbSAncnhqcy9vYnNlcnZhYmxlL29mJztcbmltcG9ydCB7IF90aHJvdyB9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS90aHJvdyc7XG5pbXBvcnQgeyBtZXJnZU1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzL21lcmdlTWFwJztcbmltcG9ydCB7IFVybCB9IGZyb20gJ3VybCc7XG5cblxuZXhwb3J0IHR5cGUgRmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24gPSB7XG4gIGhvc3Q6IEVuZ2luZUhvc3Q8e30sIHt9PjtcbiAgZGVzY3JpcHRpb246IENvbGxlY3Rpb25EZXNjcmlwdGlvbjx7fT47XG59O1xuZXhwb3J0IHR5cGUgRmFsbGJhY2tTY2hlbWF0aWNEZXNjcmlwdGlvbiA9IHtcbiAgZGVzY3JpcHRpb246IFNjaGVtYXRpY0Rlc2NyaXB0aW9uPHt9LCB7fT47XG59O1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBPcHRpb25UcmFuc2Zvcm08VCBleHRlbmRzIG9iamVjdCwgUiBleHRlbmRzIG9iamVjdD4gPSAoXG4gIHNjaGVtYXRpYzogU2NoZW1hdGljRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24sIEZhbGxiYWNrU2NoZW1hdGljRGVzY3JpcHRpb24+LFxuICBvcHRpb25zOiBULFxuKSA9PiBPYnNlcnZhYmxlPFI+O1xuXG5cbi8qKlxuICogQW4gRW5naW5lSG9zdCB0aGF0IHN1cHBvcnQgbXVsdGlwbGUgaG9zdHMgaW4gYSBmYWxsYmFjayBjb25maWd1cmF0aW9uLiBJZiBhIGhvc3QgZG9lcyBub3RcbiAqIGhhdmUgYSBjb2xsZWN0aW9uL3NjaGVtYXRpY3MsIHVzZSB0aGUgZm9sbG93aW5nIGhvc3QgYmVmb3JlIGdpdmluZyB1cC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZhbGxiYWNrRW5naW5lSG9zdCBpbXBsZW1lbnRzIEVuZ2luZUhvc3Q8e30sIHt9PiB7XG4gIHByaXZhdGUgX2hvc3RzOiBFbmdpbmVIb3N0PHt9LCB7fT5bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhZGRIb3N0PENvbGxlY3Rpb25UIGV4dGVuZHMgb2JqZWN0LCBTY2hlbWF0aWNUIGV4dGVuZHMgb2JqZWN0PihcbiAgICBob3N0OiBFbmdpbmVIb3N0PENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPixcbiAgKSB7XG4gICAgdGhpcy5faG9zdHMucHVzaChob3N0KTtcbiAgfVxuXG4gIGNyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihuYW1lOiBzdHJpbmcpOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24+IHtcbiAgICBmb3IgKGNvbnN0IGhvc3Qgb2YgdGhpcy5faG9zdHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gaG9zdC5jcmVhdGVDb2xsZWN0aW9uRGVzY3JpcHRpb24obmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHsgbmFtZSwgaG9zdCwgZGVzY3JpcHRpb24gfTtcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgVW5rbm93bkNvbGxlY3Rpb25FeGNlcHRpb24obmFtZSk7XG4gIH1cblxuICBjcmVhdGVTY2hlbWF0aWNEZXNjcmlwdGlvbihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgY29sbGVjdGlvbjogQ29sbGVjdGlvbkRlc2NyaXB0aW9uPEZhbGxiYWNrQ29sbGVjdGlvbkRlc2NyaXB0aW9uPixcbiAgKTogU2NoZW1hdGljRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24sIEZhbGxiYWNrU2NoZW1hdGljRGVzY3JpcHRpb24+IHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNvbGxlY3Rpb24uaG9zdC5jcmVhdGVTY2hlbWF0aWNEZXNjcmlwdGlvbihuYW1lLCBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcblxuICAgIHJldHVybiB7IG5hbWUsIGNvbGxlY3Rpb24sIGRlc2NyaXB0aW9uIH07XG4gIH1cblxuICBnZXRTY2hlbWF0aWNSdWxlRmFjdG9yeTxPcHRpb25UIGV4dGVuZHMgb2JqZWN0PihcbiAgICBzY2hlbWF0aWM6IFNjaGVtYXRpY0Rlc2NyaXB0aW9uPEZhbGxiYWNrQ29sbGVjdGlvbkRlc2NyaXB0aW9uLCBGYWxsYmFja1NjaGVtYXRpY0Rlc2NyaXB0aW9uPixcbiAgICBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24+KTogUnVsZUZhY3Rvcnk8T3B0aW9uVD4ge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLmhvc3QuZ2V0U2NoZW1hdGljUnVsZUZhY3Rvcnkoc2NoZW1hdGljLmRlc2NyaXB0aW9uLCBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIGNyZWF0ZVNvdXJjZUZyb21VcmwoXG4gICAgdXJsOiBVcmwsXG4gICAgY29udGV4dDogVHlwZWRTY2hlbWF0aWNDb250ZXh0PEZhbGxiYWNrQ29sbGVjdGlvbkRlc2NyaXB0aW9uLCBGYWxsYmFja1NjaGVtYXRpY0Rlc2NyaXB0aW9uPixcbiAgKTogU291cmNlIHwgbnVsbCB7XG4gICAgcmV0dXJuIGNvbnRleHQuc2NoZW1hdGljLmNvbGxlY3Rpb24uZGVzY3JpcHRpb24uaG9zdC5jcmVhdGVTb3VyY2VGcm9tVXJsKHVybCwgY29udGV4dCk7XG4gIH1cblxuICB0cmFuc2Zvcm1PcHRpb25zPE9wdGlvblQgZXh0ZW5kcyBvYmplY3QsIFJlc3VsdFQgZXh0ZW5kcyBvYmplY3Q+KFxuICAgIHNjaGVtYXRpYzogU2NoZW1hdGljRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24sIEZhbGxiYWNrU2NoZW1hdGljRGVzY3JpcHRpb24+LFxuICAgIG9wdGlvbnM6IE9wdGlvblQsXG4gICk6IE9ic2VydmFibGU8UmVzdWx0VD4ge1xuICAgIHJldHVybiAob2JzZXJ2YWJsZU9mKG9wdGlvbnMpXG4gICAgICAucGlwZSguLi50aGlzLl9ob3N0cy5tYXAoaG9zdCA9PiBtZXJnZU1hcChvcHQgPT4gaG9zdC50cmFuc2Zvcm1PcHRpb25zKHNjaGVtYXRpYywgb3B0KSkpKVxuICAgICkgYXMge30gYXMgT2JzZXJ2YWJsZTxSZXN1bHRUPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGxpc3RTY2hlbWF0aWNOYW1lc2AuXG4gICAqL1xuICBsaXN0U2NoZW1hdGljcyhcbiAgICBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uPEZhbGxiYWNrQ29sbGVjdGlvbkRlc2NyaXB0aW9uLCBGYWxsYmFja1NjaGVtYXRpY0Rlc2NyaXB0aW9uPixcbiAgKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmxpc3RTY2hlbWF0aWNOYW1lcyhjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIGxpc3RTY2hlbWF0aWNOYW1lcyhjb2xsZWN0aW9uOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248RmFsbGJhY2tDb2xsZWN0aW9uRGVzY3JpcHRpb24+KTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFsbE5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgdGhpcy5faG9zdHMuZm9yRWFjaChob3N0ID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGhvc3QubGlzdFNjaGVtYXRpY05hbWVzKGNvbGxlY3Rpb24uZGVzY3JpcHRpb24pLmZvckVhY2gobmFtZSA9PiBhbGxOYW1lcy5hZGQobmFtZSkpO1xuICAgICAgfSBjYXRjaCAoXykge31cbiAgICB9KTtcblxuICAgIHJldHVybiBbLi4uYWxsTmFtZXNdO1xuICB9XG5cbiAgY3JlYXRlVGFza0V4ZWN1dG9yKG5hbWU6IHN0cmluZyk6IE9ic2VydmFibGU8VGFza0V4ZWN1dG9yPiB7XG4gICAgZm9yIChjb25zdCBob3N0IG9mIHRoaXMuX2hvc3RzKSB7XG4gICAgICBpZiAoaG9zdC5oYXNUYXNrRXhlY3V0b3IobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGhvc3QuY3JlYXRlVGFza0V4ZWN1dG9yKG5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfdGhyb3cobmV3IFVucmVnaXN0ZXJlZFRhc2tFeGNlcHRpb24obmFtZSkpO1xuICB9XG5cbiAgaGFzVGFza0V4ZWN1dG9yKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3QgaG9zdCBvZiB0aGlzLl9ob3N0cykge1xuICAgICAgaWYgKGhvc3QuaGFzVGFza0V4ZWN1dG9yKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59XG4iXX0=