import CalibrageList from '@/components/admin/CalibrageList';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { generatePageMetadata } from '@/lib/generatePageMetadata';

export const metadata = generatePageMetadata({
    defaultTitle: 'Calibrage pédagogique',
    noIndex: true,
});

export default function CalibragePage() {
    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Calibrage pédagogique"
                description="Verdicts (critiques verbatim lues avant chaque génération) et exemplaires (étalons figés imités par le skill content-writer)."
            />
            <CalibrageList/>
        </>
    );
}
