import MobileFooter from "@/components/layout/MobileFooter";
import DesktopNavbar from "@/components/layout/DesktopNavbar";

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <DesktopNavbar />
            <main className="pb-20 md:pb-0 md:pt-16 p-4">
                {children}
            </main>
            <MobileFooter />
        </div>
    );
}
