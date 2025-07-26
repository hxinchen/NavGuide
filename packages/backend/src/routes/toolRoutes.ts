import Router from 'koa-router';
import toolController from '../controllers/toolController';

const router=new Router({
    prefix:'/api/tools'
});

router.get('/',toolController.getAllTools);
router.get('/:id',toolController.getToolById);
router.post('/',toolController.createTool);
router.put('/:id',toolController.updateTool);
router.delete('/:id',toolController.deleteTool);

export default router;