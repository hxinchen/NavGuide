import Router from 'koa-router';
import categoryController from '../controllers/categoryController';

const router =new Router({
    prefix:'/api/categories'
});

router.get('/',categoryController.getAllCategory)
router.get('/:id',categoryController.getCategoryByid)
router.post('/',categoryController.createCategory)
router.put('/:id',categoryController.updateCategory)
router.delete('/:id',categoryController.deleteCategory)

export default router;