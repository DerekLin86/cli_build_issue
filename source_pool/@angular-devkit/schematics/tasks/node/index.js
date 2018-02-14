"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../node-package/options");
const options_2 = require("../repo-init/options");
class BuiltinTaskExecutor {
}
BuiltinTaskExecutor.NodePackage = {
    name: options_1.NodePackageName,
    create: (options) => Promise.resolve().then(() => require('../node-package/executor')).then(mod => mod.default(options)),
};
BuiltinTaskExecutor.RepositoryInitializer = {
    name: options_2.RepositoryInitializerName,
    create: (options) => Promise.resolve().then(() => require('../repo-init/executor')).then(mod => mod.default(options)),
};
exports.BuiltinTaskExecutor = BuiltinTaskExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2hhbnNsL1NvdXJjZXMvaGFuc2wvZGV2a2l0LyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy90YXNrcy9ub2RlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEscURBQXlGO0FBQ3pGLGtEQUcrQjtBQUUvQjs7QUFDa0IsK0JBQVcsR0FBdUQ7SUFDaEYsSUFBSSxFQUFFLHlCQUFlO0lBQ3JCLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMscUNBQU8sMEJBQTBCLEdBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUMxRixDQUFDO0FBQ2MseUNBQXFCLEdBQzRCO0lBQy9ELElBQUksRUFBRSxtQ0FBeUI7SUFDL0IsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxxQ0FBTyx1QkFBdUIsR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZGLENBQUM7QUFUSixrREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFRhc2tFeGVjdXRvckZhY3RvcnkgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZU5hbWUsIE5vZGVQYWNrYWdlVGFza0ZhY3RvcnlPcHRpb25zIH0gZnJvbSAnLi4vbm9kZS1wYWNrYWdlL29wdGlvbnMnO1xuaW1wb3J0IHtcbiAgUmVwb3NpdG9yeUluaXRpYWxpemVyTmFtZSxcbiAgUmVwb3NpdG9yeUluaXRpYWxpemVyVGFza0ZhY3RvcnlPcHRpb25zLFxuIH0gZnJvbSAnLi4vcmVwby1pbml0L29wdGlvbnMnO1xuXG5leHBvcnQgY2xhc3MgQnVpbHRpblRhc2tFeGVjdXRvciB7XG4gIHN0YXRpYyByZWFkb25seSBOb2RlUGFja2FnZTogVGFza0V4ZWN1dG9yRmFjdG9yeTxOb2RlUGFja2FnZVRhc2tGYWN0b3J5T3B0aW9ucz4gPSB7XG4gICAgbmFtZTogTm9kZVBhY2thZ2VOYW1lLFxuICAgIGNyZWF0ZTogKG9wdGlvbnMpID0+IGltcG9ydCgnLi4vbm9kZS1wYWNrYWdlL2V4ZWN1dG9yJykudGhlbihtb2QgPT4gbW9kLmRlZmF1bHQob3B0aW9ucykpLFxuICB9O1xuICBzdGF0aWMgcmVhZG9ubHkgUmVwb3NpdG9yeUluaXRpYWxpemVyOlxuICAgIFRhc2tFeGVjdXRvckZhY3Rvcnk8UmVwb3NpdG9yeUluaXRpYWxpemVyVGFza0ZhY3RvcnlPcHRpb25zPiA9IHtcbiAgICBuYW1lOiBSZXBvc2l0b3J5SW5pdGlhbGl6ZXJOYW1lLFxuICAgIGNyZWF0ZTogKG9wdGlvbnMpID0+IGltcG9ydCgnLi4vcmVwby1pbml0L2V4ZWN1dG9yJykudGhlbihtb2QgPT4gbW9kLmRlZmF1bHQob3B0aW9ucykpLFxuICB9O1xufVxuIl19