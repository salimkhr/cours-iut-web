import CalibrageList from '@/components/admin/CalibrageList';
import { generatePageMetadata } from '@/lib/generatePageMetadata';

export const metadata = generatePageMetadata({
    defaultTitle: 'Calibrage pédagogique',
    noIndex: true,
});

export default function CalibragePage() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="text-2xl font-bold mb-2">Calibrage pédagogique</h1>
            <p className="text-sm text-bridge-500 mb-8">
                Verdicts (critiques verbatim lues avant chaque génération) et exemplaires
                (étalons figés imités par le skill content-writer).
            </p>
            <CalibrageList/>
        </main>
    );
}
