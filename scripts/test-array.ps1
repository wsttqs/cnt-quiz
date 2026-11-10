# ============== Sheet 3: Questions ==============
$questionsHeaders = @("question_id","group_id","text","order","is_public","img_path","options")
$questionsRows = @(
    @("Q1","G1",        "你家最主要的问题是？",  1,"false","q1.jpg","宠物毛发&split&灰尘&split&顽固污渍&split&其他"),
    @("Q2","G2",        "你的房屋面积是多少？",  1,"true", "q2.jpg","小于 50㎡&split&50-100㎡&split&大于 100㎡"),
    @("Q3","G_heavy_pet","严重程度如何？",       1,"false","q3.jpg","非常严重&split&比较严重"),
    @("Q4","G_heavy_pet","想自己处理还是找专业？",2,"false","q4.jpg","专业服务&split&自己动手")
)
$validations_questions = @( '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="is_public" prompt="true=公共题（不参与评分）" sqref="E2:E1000"><formula1>"true,false"</formula1></dataValidation>' )



Write-Output ('questionsRows.Count: {0}' -f $questionsRows.Count)
for ($r = 0; $r -lt $questionsRows.Count; $r++) {
    Write-Output ('Row {0}: {1} cols' -f $r, $questionsRows[$r].Count)
    for ($c = 0; $c -lt $questionsRows[$r].Count; $c++) {
        $val = [string]$questionsRows[$r][$c]
        Write-Output ('  [{0}] type={1} value={2} len={3}' -f $c, $questionsRows[$r][$c].GetType().Name, $val, $val.Length)
    }
}
