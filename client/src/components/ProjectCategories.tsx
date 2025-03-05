import { motion } from "framer-motion";
import { 
  MdWeb,
  MdPhoneAndroid,
  MdPayments,
  MdMessage
} from "react-icons/md";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ProjectCategoriesProps {
  categories: Category[];
  selectedCategories: string[];
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "browser":
      return <MdWeb className="w-6 h-6" />;
    case "mobile":
      return <MdPhoneAndroid className="w-6 h-6" />;
    case "finance":
      return <MdPayments className="w-6 h-6" />;
    case "message":
      return <MdMessage className="w-6 h-6" />;
    default:
      return <MdWeb className="w-6 h-6" />;
  }
};

export function ProjectCategories({
  categories,
  selectedCategories,
  onSelectCategory,
}: ProjectCategoriesProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Категории проектов</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
              className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 p-4"
              onClick={() => onSelectCategory(category.id)}
            >
              {getCategoryIcon(category.icon)}
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}