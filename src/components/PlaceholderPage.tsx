const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="container py-20">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{title}</h1>
      <p className="mt-4 text-muted-foreground">This page is under construction.</p>
    </div>
  );
};

export default PlaceholderPage;
