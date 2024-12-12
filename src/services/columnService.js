import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const createNew = async (reqBody) => {

  try {
    //Xử lý logic dữ liệu
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {

  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {

  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    //Xoa column
    await columnModel.deleteOneById(columnId)
    //Xoa toan bo cards trong column
    await cardModel.deleteManyByColumnId(columnId)
    //Xoa ColumnId trong mang columnOrderIds cua board chua no
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its Cards deleted successfully!' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}