/** Types partagés entre les composants d'administration, pour éviter que
 *  ExportImportSheet ait à importer AdminToolsPanel (cycle d'import). */

export interface ModuleOption {
    path: string;
    title: string;
}
