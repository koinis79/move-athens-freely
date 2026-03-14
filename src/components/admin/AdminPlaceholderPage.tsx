import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPlaceholderPageProps {
  title: string;
}

const AdminPlaceholderPage = ({ title }: AdminPlaceholderPageProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4965] mb-6">{title}</h1>
      <Card className="border-dashed border-2 border-[#E2E4E9] bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-lg text-[#4A5568]">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#718096]">Page coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlaceholderPage;
